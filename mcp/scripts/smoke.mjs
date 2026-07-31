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
const wordmarkAsset = manifest.assets.find((asset) => asset.id === "wordmark");
const pendingTopic = colors.pending?.[0]?.topic;

assert(svgAsset, "The asset manifest must contain at least one asset.");
assert(wordmarkAsset, "The asset manifest must contain the wordmark asset.");
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
  assert(
    instructions.includes('get_stylesheet の name="components"'),
    "Instructions must direct consumers to the component stylesheet.",
  );

  const { tools } = await client.listTools();
  assert.deepEqual(
    tools.map((tool) => tool.name).sort(),
    ["get_asset", "get_stylesheet", "get_tokens", "read_guideline"],
  );
  assert(
    tools
      .find((tool) => tool.name === "get_asset")
      ?.description?.includes(svgAsset.id),
    "get_asset description must include valid asset ids.",
  );
  const guidelineTool = tools.find((tool) => tool.name === "read_guideline");
  assert(
    guidelineTool?.description?.includes("guidelines"),
    "read_guideline description must include valid document ids.",
  );
  assert.equal(
    guidelineTool.outputSchema,
    undefined,
    "read_guideline must not expose an output schema.",
  );
  const stylesheetTool = tools.find((tool) => tool.name === "get_stylesheet");
  assert(
    stylesheetTool?.description?.includes("components"),
    "get_stylesheet description must include valid stylesheet names.",
  );
  assert.equal(
    stylesheetTool.outputSchema,
    undefined,
    "get_stylesheet must not expose an output schema.",
  );

  const tokensResult = await client.callTool({
    name: "get_tokens",
    arguments: {},
  });
  assert.equal(tokensResult.isError, undefined);
  const tokensOutput = tokensResult.structuredContent;
  assert(tokensOutput && typeof tokensOutput === "object");
  const tokensText = tokensResult.content.find(
    (content) => content.type === "text",
  );
  assert(tokensText);
  assert.deepEqual(
    JSON.parse(tokensText.text),
    tokensOutput,
    "get_tokens text JSON must equal structuredContent.",
  );
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
  assert(
    typographyCategory.roles.some(
      (role) =>
        role.family === "body" &&
        role.resolved?.family.includes("Hsg Line Seed JP"),
    ),
    "Typography roles must preserve symbolic family values and resolve resolved.family to a font name.",
  );

  const assetResult = await client.callTool({
    name: "get_asset",
    arguments: { id: svgAsset.id },
  });
  assert.equal(assetResult.isError, undefined);
  const assetOutput = assetResult.structuredContent;
  assert(assetOutput && typeof assetOutput === "object");
  const assetText = assetResult.content.find(
    (content) => content.type === "text",
  );
  assert(assetText);
  assert.deepEqual(
    JSON.parse(assetText.text),
    assetOutput,
    "get_asset text JSON must equal structuredContent.",
  );
  assert.equal(assetOutput.asset.id, svgAsset.id);
  if (svgAsset.format === "image/svg+xml") {
    assert.match(assetOutput.svgSource, /<svg[\s>]/);
  }

  const wordmarkResult = await client.callTool({
    name: "get_asset",
    arguments: { id: "wordmark" },
  });
  assert.equal(wordmarkResult.isError, undefined);
  const wordmarkOutput = wordmarkResult.structuredContent;
  assert(wordmarkOutput && typeof wordmarkOutput === "object");
  assert.equal(wordmarkOutput.asset.id, "wordmark");
  assert.equal(wordmarkOutput.asset.viewBox, wordmarkAsset.viewBox);
  assert.match(wordmarkOutput.svgSource, /<svg[\s>]/);
  assert.match(wordmarkOutput.svgSource, /fill="currentColor"/);

  const guidelineResult = await client.callTool({
    name: "read_guideline",
    arguments: { id: "guidelines" },
  });
  assert.equal(guidelineResult.isError, undefined);
  assert.equal(guidelineResult.structuredContent, undefined);
  const guidelineText = guidelineResult.content.find(
    (content) => content.type === "text",
  );
  assert(guidelineText);
  assert(
    guidelineText.text.includes("# Hashigodaka デザインガイドライン"),
    "read_guideline text must include the guideline heading.",
  );

  const stylesheetResult = await client.callTool({
    name: "get_stylesheet",
    arguments: { name: "components" },
  });
  assert.equal(stylesheetResult.isError, undefined);
  assert.equal(stylesheetResult.structuredContent, undefined);
  const stylesheetText = stylesheetResult.content.find(
    (content) => content.type === "text",
  );
  assert(stylesheetText);
  assert(
    stylesheetText.text.includes(".hsg-button"),
    "get_stylesheet components text must include .hsg-button.",
  );

  console.log(
    "smoke: instructions and get_tokens/get_asset/read_guideline/get_stylesheet passed",
  );
} finally {
  await client.close();
}
