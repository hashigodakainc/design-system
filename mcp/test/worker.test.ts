import assert from "node:assert/strict";
import test from "node:test";

import snapshotJson from "../src/generated/design-snapshot.json" with {
  type: "json",
};
import {
  createWorker,
  readBoundedRequest,
  validateRequestHost,
  validateRequestOrigin,
} from "../src/worker.ts";

const worker = createWorker(snapshotJson);
const assetRequests: Request[] = [];
const env = {
  ASSETS: {
    fetch(request: Request) {
      assetRequests.push(request);
      return Promise.resolve(
        new Response("<svg></svg>", {
          headers: { "Content-Type": "image/svg+xml" },
        }),
      );
    },
  },
};

function request(path: string, init: RequestInit = {}): Request {
  const headers = new Headers(init.headers);
  if (!headers.has("host")) {
    headers.set("host", "mcp-design.hashigodaka.co.jp");
  }
  return new Request(`https://mcp-design.hashigodaka.co.jp${path}`, {
    ...init,
    headers,
  });
}

async function fetchWorker(path: string, init: RequestInit = {}) {
  return worker.fetch(request(path, init), env);
}

test("Hono routes health, not-found, and method responses", async () => {
  const health = await fetchWorker("/health");
  assert.equal(health.status, 200);
  assert.equal((await health.json()).ok, true);
  assert.equal(health.headers.get("access-control-allow-origin"), "*");

  const headHealth = await fetchWorker("/health", { method: "HEAD" });
  assert.equal(headHealth.status, 404);

  const missing = await fetchWorker("/missing");
  assert.equal(missing.status, 404);
  assert.deepEqual(await missing.json(), { ok: false, error: "Not found" });

  const mcpGet = await fetchWorker("/mcp");
  assert.equal(mcpGet.status, 405);
  assert.equal(mcpGet.headers.get("allow"), "POST, OPTIONS");

  const mcpGetWithMalformedJson = await fetchWorker("/mcp", {
    method: "GET",
    headers: { "content-type": "application/json" },
  });
  assert.equal(mcpGetWithMalformedJson.status, 405);
  assert.equal(mcpGetWithMalformedJson.headers.get("allow"), "POST, OPTIONS");
});

test("static assets use the snapshot allowlist and Cloudflare binding", async () => {
  assetRequests.length = 0;
  const asset = await fetchWorker("/assets/wordmarks/wordmark.svg");
  assert.equal(asset.status, 200);
  assert.match(asset.headers.get("content-type") ?? "", /image\/svg\+xml/);
  assert.equal(asset.headers.get("access-control-allow-origin"), "*");
  assert.equal(assetRequests.length, 1);
  assert.equal(new URL(assetRequests[0].url).pathname, "/wordmarks/wordmark.svg");

  const head = await fetchWorker("/assets/wordmarks/wordmark.svg", {
    method: "HEAD",
  });
  assert.equal(head.status, 200);

  const options = await fetchWorker("/assets/not-registered.svg", {
    method: "OPTIONS",
  });
  assert.equal(options.status, 204);

  const method = await fetchWorker("/assets/wordmarks/wordmark.svg", {
    method: "POST",
  });
  assert.equal(method.status, 405);
  assert.equal(method.headers.get("allow"), "GET, HEAD, OPTIONS");

  const missing = await fetchWorker("/assets/not-registered.svg");
  assert.equal(missing.status, 404);
});

test("MCP options and initialize requests pass through the Hono adapter", async () => {
  const options = await fetchWorker("/mcp", { method: "OPTIONS" });
  assert.equal(options.status, 204);
  assert.equal(options.headers.get("access-control-allow-methods"), "POST, OPTIONS");

  const initialize = await fetchWorker("/mcp", {
    method: "POST",
    headers: {
      accept: "application/json, text/event-stream",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-03-26",
        capabilities: {},
        clientInfo: { name: "worker-test", version: "0.1.0" },
      },
    }),
  });
  assert.equal(initialize.status, 200);
  assert.equal(initialize.headers.get("access-control-allow-origin"), "*");
  assert.match(await initialize.text(), /result/);
});

test("MCP guards enforce host, exact origins, and body limits", async () => {
  const forbiddenHost = await fetchWorker("/mcp", {
    method: "OPTIONS",
    headers: { host: "attacker.example" },
  });
  assert.equal(forbiddenHost.status, 403);

  const forbiddenOrigin = await fetchWorker("/mcp", {
    method: "OPTIONS",
    headers: { origin: "https://attacker.example" },
  });
  assert.equal(forbiddenOrigin.status, 403);

  const malformedConfiguredOriginWorker = createWorker(snapshotJson);
  const malformedOrigin = await malformedConfiguredOriginWorker.fetch(
    request("/mcp", {
      method: "OPTIONS",
      headers: { origin: "https://mcp-design.hashigodaka.co.jp" },
    }),
    { ...env, MCP_ALLOWED_ORIGINS: "https://client.example/" },
  );
  assert.equal(malformedOrigin.status, 503);

  const oversized = await fetchWorker("/mcp", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: new Uint8Array(1024 * 1024 + 1),
  });
  assert.equal(oversized.status, 413);
});

test("bounded requests strip credential and transfer headers", async () => {
  const bounded = await readBoundedRequest(
    new Request("https://mcp-design.hashigodaka.co.jp/mcp", {
      method: "POST",
      headers: {
        authorization: "Bearer secret",
        cookie: "session=secret",
        "cf-access-jwt-assertion": "secret",
        "content-length": "2",
        "transfer-encoding": "chunked",
        "content-type": "application/json",
      },
      body: "{}",
    }),
    1024,
  );

  assert(bounded);
  assert.equal(await bounded.text(), "{}");
  assert.equal(bounded.headers.has("authorization"), false);
  assert.equal(bounded.headers.has("cookie"), false);
  assert.equal(bounded.headers.has("cf-access-jwt-assertion"), false);
  assert.equal(bounded.headers.has("content-length"), false);
  assert.equal(bounded.headers.has("transfer-encoding"), false);
});

test("host and origin helpers reject malformed values", () => {
  assert.equal(
    validateRequestHost(
      new Request("https://mcp-design.hashigodaka.co.jp/mcp", {
        headers: { host: "127.0.0.1:8787" },
      }),
    ),
    undefined,
  );
  assert.equal(
    validateRequestHost(
      new Request("https://mcp-design.hashigodaka.co.jp/mcp", {
        headers: { host: "127.0.0.1.evil.example" },
      }),
    )?.status,
    403,
  );

  const allowed = validateRequestOrigin(
    new Request("https://mcp-design.hashigodaka.co.jp/mcp", {
      headers: { origin: "https://client.example" },
    }),
    new URL("https://mcp-design.hashigodaka.co.jp/mcp"),
    "https://client.example",
  );
  assert.equal(allowed, undefined);

  const malformed = validateRequestOrigin(
    new Request("https://mcp-design.hashigodaka.co.jp/mcp", {
      headers: { origin: "https://client.example/" },
    }),
    new URL("https://mcp-design.hashigodaka.co.jp/mcp"),
    "https://client.example",
  );
  assert.equal(malformed?.status, 403);
});
