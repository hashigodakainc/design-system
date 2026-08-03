import assert from "node:assert/strict";

import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";

const baseUrl = new URL(
  process.env.MCP_BASE_URL ?? "https://mcp-design.hashigodaka.co.jp",
);
const endpointUrl = new URL("/mcp", baseUrl);
const publicAssetOrigin = new URL(
  process.env.MCP_ASSET_ORIGIN ?? "https://mcp-design.hashigodaka.co.jp",
);
const expectedTools = [
  "get_asset",
  "get_stylesheet",
  "get_tokens",
  "read_guideline",
];

const healthResponse = await fetch(new URL("/health", baseUrl));
assert.equal(healthResponse.status, 200, `health returned ${healthResponse.status}`);
const health = await healthResponse.json();
assert.equal(health.ok, true);
assert.equal(health.service, "hashigodaka-design-mcp");
assert(health.snapshot?.textFileCount > 0, "snapshot must contain text files");
assert(health.snapshot?.staticAssetCount > 0, "snapshot must contain static assets");

const client = new Client({
  name: "hashigodaka-design-system-remote-smoke",
  version: "0.1.0",
});
const transport = new StreamableHTTPClientTransport(endpointUrl);

try {
  await client.connect(transport);

  assert.match(client.getInstructions() ?? "", /Hashigodakaデザインシステム/);

  const { tools } = await client.listTools();
  assert.deepEqual(
    tools.map((tool) => tool.name).sort(),
    expectedTools,
  );

  const tokens = await client.callTool({
    name: "get_tokens",
    arguments: { category: "color" },
  });
  assert.notEqual(tokens.isError, true);
  assert.equal(tokens.structuredContent?.categories?.[0]?.category, "color");

  const asset = await client.callTool({
    name: "get_asset",
    arguments: { id: "wordmark" },
  });
  assert.notEqual(asset.isError, true);
  const assetUrl = asset.structuredContent?.asset?.url;
  assert.equal(typeof assetUrl, "string");
  assert.equal(new URL(assetUrl).origin, publicAssetOrigin.origin);
  assert.equal(new URL(assetUrl).pathname, "/assets/wordmarks/wordmark.svg");

  const assetResponse = await fetch(
    new URL(new URL(assetUrl).pathname, baseUrl),
  );
  assert.equal(assetResponse.status, 200, `asset returned ${assetResponse.status}`);
  assert.match(assetResponse.headers.get("content-type") ?? "", /image\/svg\+xml/);
  assert.match(await assetResponse.text(), /<svg[\s>]/);

  const guideline = await client.callTool({
    name: "read_guideline",
    arguments: { id: "guidelines" },
  });
  assert.notEqual(guideline.isError, true);
  assert.match(guideline.content?.[0]?.text ?? "", /デザインガイドライン/);

  const stylesheet = await client.callTool({
    name: "get_stylesheet",
    arguments: { name: "components" },
  });
  assert.notEqual(stylesheet.isError, true);
  assert.match(stylesheet.content?.[0]?.text ?? "", /\.hsg-button/);

  console.log(`remote smoke passed: ${endpointUrl}`);
} finally {
  await client.close();
}
