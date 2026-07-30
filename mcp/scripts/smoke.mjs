import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";

const serverPath = new URL("../dist/index.js", import.meta.url);
const manifestPath = new URL("../../assets/manifest.json", import.meta.url);
const colorsPath = new URL("../../tokens/colors.json", import.meta.url);

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const colors = JSON.parse(await readFile(colorsPath, "utf8"));
const svgAsset =
  manifest.assets.find((asset) => asset.format === "image/svg+xml") ??
  manifest.assets[0];
const pendingTopic = colors.pending?.[0]?.topic;

assert(svgAsset, "The asset manifest must contain at least one asset.");
assert(pendingTopic, "colors.json must expose the current pending topic.");

const client = new Client({
  name: "hashigodaka-design-system-smoke",
  version: "0.1.0",
});
const transport = new StdioClientTransport({
  command: process.execPath,
  args: [fileURLToPath(serverPath)],
  cwd: tmpdir(),
  stderr: "pipe",
});

try {
  await client.connect(transport);

  const instructions = client.getInstructions();
  assert(instructions, "The initialize response must include instructions.");
  assert.match(instructions, /Hashigodakaデザインシステム/);
  assert(
    instructions.includes(pendingTopic),
    "Instructions must include the aggregated pending topic.",
  );

  const { tools } = await client.listTools();
  assert.deepEqual(
    tools.map((tool) => tool.name).sort(),
    ["get_asset", "get_tokens", "read_guideline"],
  );
  assert(
    tools
      .find((tool) => tool.name === "get_asset")
      ?.description?.includes(svgAsset.id),
    "get_asset description must include valid asset ids.",
  );
  assert(
    tools
      .find((tool) => tool.name === "read_guideline")
      ?.description?.includes("guidelines"),
    "read_guideline description must include valid document ids.",
  );

  const tokensResult = await client.callTool({
    name: "get_tokens",
    arguments: {},
  });
  assert.equal(tokensResult.isError, undefined);
  const tokensOutput = tokensResult.structuredContent;
  assert(tokensOutput && typeof tokensOutput === "object");
  assert(Array.isArray(tokensOutput.categories));
  assert.equal(tokensOutput.categories.length, 3);
  const colorCategory = tokensOutput.categories.find(
    (category) => category.category === "color",
  );
  const typographyCategory = tokensOutput.categories.find(
    (category) => category.category === "typography",
  );
  assert(
    colorCategory?.tokens.some(
      (token) =>
        token.name === "color.action.primary.hover.border" &&
        token.value === "{color.action.primary.hover.background}" &&
        token.resolved === "#35313A",
    ),
    "get_tokens must return original and recursively resolved values.",
  );
  assert.equal(
    typographyCategory?.roles.length,
    11,
    "get_tokens must include typography roles.",
  );

  const assetResult = await client.callTool({
    name: "get_asset",
    arguments: { id: svgAsset.id },
  });
  assert.equal(assetResult.isError, undefined);
  const assetOutput = assetResult.structuredContent;
  assert(assetOutput && typeof assetOutput === "object");
  assert.equal(assetOutput.asset.id, svgAsset.id);
  if (svgAsset.format === "image/svg+xml") {
    assert.match(assetOutput.svgSource, /<svg[\s>]/);
  }

  const guidelineResult = await client.callTool({
    name: "read_guideline",
    arguments: { id: "guidelines" },
  });
  assert.equal(guidelineResult.isError, undefined);
  const guidelineOutput = guidelineResult.structuredContent;
  assert(guidelineOutput && typeof guidelineOutput === "object");
  assert.equal(guidelineOutput.source.path, "docs/guidelines.md");
  assert.equal(Object.hasOwn(guidelineOutput, "markdown"), false);
  const guidelineText = guidelineResult.content.find(
    (content) => content.type === "text",
  );
  assert(guidelineText);
  assert.match(
    guidelineText.text,
    /^# Hashigodaka デザインガイドライン/m,
  );

  console.log(
    "smoke: instructions and get_tokens/get_asset/read_guideline passed",
  );
} finally {
  await client.close();
}
