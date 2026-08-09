import { createMcpHonoApp } from "@modelcontextprotocol/hono";
import { createMcpHandler } from "@modelcontextprotocol/server";
import { Hono } from "hono";

import snapshotJson from "./generated/design-snapshot.json" with { type: "json" };
import { SnapshotRepositoryLoader } from "./loaders/snapshot.js";
import { createServer } from "./mcp/server.js";
import type { DesignSystemSnapshot } from "./snapshot.js";

const MCP_PATH = "/mcp";
const HEALTH_PATH = "/mcp/health";
const PRODUCTION_HOSTNAME = "design.hashigodaka.co.jp";
const ASSET_BASE_URL = "https://design.hashigodaka.co.jp/";
const MAX_MCP_BODY_BYTES = 1024 * 1024;
const MCP_CREDENTIAL_HEADERS = [
  "authorization",
  "proxy-authorization",
  "cookie",
  "cf-access-jwt-assertion",
  "cf-access-client-id",
  "cf-access-client-secret",
] as const;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Authorization, Content-Type, mcp-protocol-version, mcp-method, mcp-name",
  "Access-Control-Expose-Headers": "mcp-protocol-version",
};
interface WorkerEnv {
  MCP_ALLOWED_ORIGINS?: string;
}

export function createWorker(
  snapshot: DesignSystemSnapshot,
): ExportedHandler<WorkerEnv> {
  const loader = new SnapshotRepositoryLoader(snapshot, {
    assetBaseUrl: ASSET_BASE_URL,
  });
  const handler = createMcpHandler(() => createServer(loader), {
    // Keep the existing initialize-based clients working while also advertising
    // the modern 2026-07-28 era through server/discover.
    legacy: "stateless",
  });

  // The SDK adapter contributes Hono's Web Standard request handling and JSON
  // body parser.  We deliberately disable its localhost defaults here because
  // this app also serves a public health route; the /mcp-only Host and Origin
  // policy is applied by the Worker entry below.
  // Keep the SDK's JSON parser scoped to /mcp. A top-level adapter would try
  // to parse an unrelated asset request carrying an application/json header.
  const mcpApp = createMcpHonoApp({ host: PRODUCTION_HOSTNAME });
  const app = new Hono<{ Bindings: WorkerEnv }>();

  app.notFound(() => jsonResponse({ ok: false, error: "Not found" }, 404));

  const healthResponse = () =>
    jsonResponse({
      ok: true,
      service: "hashigodaka-design-mcp",
      snapshot: {
        generatedAt: snapshot.generatedAt,
        textFileCount: Object.keys(snapshot.textFiles).length,
        staticAssetCount: snapshot.staticAssets.length,
      },
    });
  app.get(HEALTH_PATH, healthResponse);

  // Keep the health endpoint GET-only. Hono may otherwise treat HEAD as an
  // implicit GET route.
  app.on("HEAD", HEALTH_PATH, () =>
    jsonResponse({ ok: false, error: "Not found" }, 404),
  );

  mcpApp.all("*", async (context) => {
    if (context.req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (context.req.method !== "POST") {
      return jsonResponse(
        { ok: false, error: "Method not allowed" },
        405,
        { Allow: "POST, OPTIONS" },
      );
    }

    return withHeaders(await handler.fetch(context.req.raw), corsHeaders);
  });

  app.all(MCP_PATH, (context) => {
    // Hono's executionCtx accessor throws when the app is invoked directly in
    // unit tests (where Cloudflare does not provide one). Preserve it in the
    // actual Worker runtime while keeping the fetch-shaped handler portable.
    let executionCtx: Parameters<typeof mcpApp.fetch>[2];
    try {
      executionCtx = context.executionCtx;
    } catch {
      // Direct Hono invocations have no Cloudflare execution context.
    }
    return executionCtx === undefined
      ? mcpApp.fetch(context.req.raw, context.env)
      : mcpApp.fetch(context.req.raw, context.env, executionCtx);
  });

  return {
    async fetch(request, env, ctx): Promise<Response> {
      const url = new URL(request.url);

      if (url.pathname === HEALTH_PATH && request.method === "HEAD") {
        return jsonResponse({ ok: false, error: "Not found" }, 404);
      }

      if (url.pathname === MCP_PATH) {
        const hostRejection = validateRequestHost(request);
        if (hostRejection) {
          return hostRejection;
        }

        const originRejection = validateRequestOrigin(
          request,
          url,
          env.MCP_ALLOWED_ORIGINS,
        );
        if (originRejection) {
          return originRejection;
        }

        if (request.method === "OPTIONS") {
          return new Response(null, { status: 204, headers: corsHeaders });
        }
        if (request.method !== "POST") {
          return jsonResponse(
            { ok: false, error: "Method not allowed" },
            405,
            { Allow: "POST, OPTIONS" },
          );
        }

        // Bound and sanitize before entering the adapter's JSON parser. This
        // keeps oversized JSON from being cloned/parsed by middleware first.
        const mcpRequest = await readBoundedRequest(
          request,
          MAX_MCP_BODY_BYTES,
        );
        if (!mcpRequest) {
          return jsonResponse({ ok: false, error: "Payload too large" }, 413);
        }
        return withMcpCors(await app.fetch(mcpRequest, env, ctx));
      }

      return app.fetch(request, env, ctx);
    },
  } satisfies ExportedHandler<WorkerEnv>;
}

export function validateRequestHost(request: Request): Response | undefined {
  const host = request.headers.get("host");
  if (host === null) {
    return jsonResponse({ ok: false, error: "Forbidden host" }, 403);
  }

  let hostname: string;
  try {
    const normalizedHost = host.toLowerCase();
    const parsedHost = new URL(`http://${normalizedHost}`);
    if (
      parsedHost.host !== normalizedHost ||
      parsedHost.pathname !== "/" ||
      parsedHost.search ||
      parsedHost.hash ||
      parsedHost.username ||
      parsedHost.password
    ) {
      return jsonResponse({ ok: false, error: "Forbidden host" }, 403);
    }
    hostname = parsedHost.hostname;
  } catch {
    return jsonResponse({ ok: false, error: "Forbidden host" }, 403);
  }

  return hostname === PRODUCTION_HOSTNAME || isLoopbackHostname(hostname)
    ? undefined
    : jsonResponse({ ok: false, error: "Forbidden host" }, 403);
}

export async function readBoundedRequest(
  request: Request,
  maximumBytes: number,
): Promise<Request | undefined> {
  const contentLength = request.headers.get("content-length");
  if (contentLength !== null) {
    const declaredBytes = Number(contentLength);
    if (
      Number.isFinite(declaredBytes) &&
      declaredBytes > maximumBytes
    ) {
      return undefined;
    }
  }

  const headers = sanitizedMcpHeaders(request.headers);
  if (!request.body) {
    return new Request(request.url, {
      method: request.method,
      headers,
      signal: request.signal,
    });
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      totalBytes += value.byteLength;
      if (totalBytes > maximumBytes) {
        await reader.cancel();
        return undefined;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new Request(request.url, {
    method: request.method,
    headers,
    body,
    signal: request.signal,
  });
}

function sanitizedMcpHeaders(source: Headers): Headers {
  const headers = new Headers(source);
  headers.delete("content-length");
  headers.delete("transfer-encoding");
  for (const name of MCP_CREDENTIAL_HEADERS) {
    headers.delete(name);
  }
  return headers;
}

export function validateRequestOrigin(
  request: Request,
  requestUrl: URL,
  configuredOrigins: string | undefined,
): Response | undefined {
  const origin = request.headers.get("origin");
  if (origin === null) {
    return undefined;
  }

  let normalizedOrigin: string;
  try {
    const parsedOrigin = new URL(origin);
    normalizedOrigin = parsedOrigin.origin;
    if (origin !== normalizedOrigin) {
      return jsonResponse({ ok: false, error: "Forbidden origin" }, 403);
    }
  } catch {
    return jsonResponse({ ok: false, error: "Forbidden origin" }, 403);
  }

  const allowedOrigins = new Set([requestUrl.origin]);
  for (const value of configuredOrigins?.split(",") ?? []) {
    const candidate = value.trim();
    if (!candidate) {
      continue;
    }
    try {
      const url = new URL(candidate);
      const secureOrLoopback =
        url.protocol === "https:" ||
        (url.protocol === "http:" && isLoopbackHostname(url.hostname));
      if (url.origin !== candidate || !secureOrLoopback) {
        return jsonResponse(
          { ok: false, error: "Origin validation is not configured" },
          503,
        );
      }
      allowedOrigins.add(url.origin);
    } catch {
      return jsonResponse(
        { ok: false, error: "Origin validation is not configured" },
        503,
      );
    }
  }

  return allowedOrigins.has(normalizedOrigin)
    ? undefined
    : jsonResponse({ ok: false, error: "Forbidden origin" }, 403);
}

function isLoopbackHostname(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname === "::1" ||
    hostname === "[::1]" ||
    /^127(?:\.\d{1,3}){3}$/.test(hostname)
  );
}

function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
  headers: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders,
      ...headers,
    },
  });
}

function withHeaders(
  response: Response,
  headers: Record<string, string>,
): Response {
  const nextHeaders = new Headers(response.headers);
  for (const [name, value] of Object.entries(headers)) {
    nextHeaders.set(name, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: nextHeaders,
  });
}

function withMcpCors(response: Response): Response {
  return withHeaders(response, corsHeaders);
}

export default createWorker(snapshotJson as DesignSystemSnapshot);
