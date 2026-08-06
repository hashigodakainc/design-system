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
  const colorTokens = tokens.structuredContent?.categories?.[0]?.tokens ?? [];
  const colorNames = new Set(colorTokens.map((token) => token.name));
  assert(colorNames.has("color.neutral.0"));
  assert(colorNames.has("color.background.raised"));
  assert(!colorNames.has("color.neutral.canvas"));
  assert.deepEqual(
    new Set(colorTokens.map((token) => token.layer)),
    new Set(["primitive", "semantic"]),
  );

  const components = await client.callTool({
    name: "get_tokens",
    arguments: { category: "component" },
  });
  assert.notEqual(components.isError, true);
  const componentCategory = components.structuredContent?.categories?.[0];
  assert.equal(componentCategory?.category, "component");
  assert.equal(componentCategory?.source?.path, "tokens/components.json");
  assert.deepEqual(components.structuredContent?.status, [
    { source: "tokens/components.json", status: "selected" },
  ]);
  assert.deepEqual(components.structuredContent?.pending, []);
  const componentTokens = componentCategory?.tokens ?? [];
  assert.equal(componentTokens.length, 40);
  const componentNames = new Set(componentTokens.map((token) => token.name));
  for (const name of [
    "button.primary.background",
    "badge.primary.background",
    "menu.foreground",
    "card.foreground",
  ]) assert(componentNames.has(name), `missing ${name}`);
  assert(
    componentTokens.every((token) => token.layer === "component"),
  );

  const typography = await client.callTool({
    name: "get_tokens",
    arguments: { category: "typography" },
  });
  assert.notEqual(typography.isError, true);
  const typographyCategory = typography.structuredContent?.categories?.[0];
  const typographyNames = new Set(
    (typographyCategory?.tokens ?? []).map((token) => token.name),
  );
  assert(typographyNames.has("typography.size.label-large"));
  const roleNames = new Set(
    (typographyCategory?.roles ?? []).map((role) => role.name),
  );
  assert(roleNames.has("label-large"));

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
