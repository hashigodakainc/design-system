import assert from "node:assert/strict";
import test from "node:test";
import snapshot from "../src/generated/design-snapshot.json" with { type: "json" };
import { SnapshotRepositoryLoader } from "../src/loaders/snapshot.ts";
import { getPresentationProfile } from "../src/presentation.ts";
import { createWorker } from "../src/worker.ts";
const load = () =>
  new SnapshotRepositoryLoader(snapshot, {
    assetBaseUrl: "https://design.hashigodaka.co.jp",
  }).load();
test("profile preserves provenance, pending state, units, semantic references and asset usage", () => {
  const repository = load();
  const result = getPresentationProfile(repository);
  assert.equal(result.schemaVersion, 1);
  assert.equal(result.source.path, "tokens/presentation.json");
  assert.equal(result.source.status, "candidate");
  assert(result.source.pending.length > 0);
  assert.equal(result.profile.typeUnit, "pt");
  assert.equal(result.profile.canvas.unit, "in");
  for (const [role, alias] of Object.entries(result.references.colors)) {
    const token = [...repository.tokenCategories.values()]
      .flatMap((c) => c.tokens)
      .find((t) => t.name === alias.slice(1, -1));
    assert(token);
    assert.equal(result.profile.colors[role], token.resolved);
  }
  for (const asset of result.assets) {
    assert(asset.svgSource?.includes("<svg"));
    assert(Array.isArray(asset.asset.restrictions));
    assert(
      String(asset.asset.url).startsWith(
        "https://design.hashigodaka.co.jp/assets/",
      ),
    );
  }
});
test("upstream semantic edits flow into the resolved profile", () => {
  const repository = load();
  repository.tokenCategories
    .get("color")!
    .tokens.find((t) => t.name === "color.text.primary")!.resolved = "#112233";
  assert.equal(
    getPresentationProfile(repository).profile.colors.text,
    "#112233",
  );
});
// Invalid equivalence classes and geometry boundaries. Rendering and application
// font substitution are separate manual checks, not inferred from these tests.
for (const [name, mutate] of Object.entries({
  schema: (p: any) => {
    p.schemaVersion = 2;
  },
  target: (p: any) => {
    p.target = "unknown";
  },
  zeroDimension: (p: any) => {
    p.canvas.width = 0;
  },
  crossedRegions: (p: any) => {
    p.layout.bodyY = p.layout.bodyBottom;
  },
  footerBoundary: (p: any) => {
    p.layout.footerY = p.canvas.height;
  },
  marginBoundary: (p: any) => {
    p.layout.margin = p.canvas.width / 2;
  },
  rawColor: (p: any) => {
    p.colors.text = "#112233";
  },
  unknownAlias: (p: any) => {
    p.colors.text = "{color.missing}";
  },
  primitiveAlias: (p: any) => {
    p.colors.text = "{color.neutral.900}";
  },
  wrongType: (p: any) => {
    p.colors.text = "{typography.size.16}";
  },
  missingAsset: (p: any) => {
    p.assetIds = ["missing"];
  },
  noPending: (p: any) => {
    p.pending = [];
  },
})) {
  test(`invalid profile fails closed: ${name}`, () => {
    const repository = load();
    mutate(repository.presentation);
    assert.throws(() => getPresentationProfile(repository));
  });
}
async function rpc(method: string, params: object) {
  const response = await createWorker(snapshot).fetch(
    new Request("https://design.hashigodaka.co.jp/mcp", {
      method: "POST",
      headers: {
        host: "design.hashigodaka.co.jp",
        "content-type": "application/json",
        accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    }),
    {},
  );
  assert.equal(response.status, 200);
  const text = await response.text();
  return JSON.parse(
    text.startsWith("{")
      ? text
      : text
          .split("\n")
          .find((line) => line.startsWith("data: "))!
          .slice(6),
  );
}
test("MCP tool discovery, text/JSON equivalence, and invalid target", async () => {
  const list = await rpc("tools/list", {});
  const tool = list.result.tools.find(
    (t: any) => t.name === "get_presentation_profile",
  );
  assert(tool);
  assert.equal(tool.annotations.readOnlyHint, true);
  const response = await rpc("tools/call", {
    name: tool.name,
    arguments: { target: "google-slides" },
  });
  assert.notEqual(response.result.isError, true);
  assert.deepEqual(
    JSON.parse(response.result.content[0].text),
    response.result.structuredContent,
  );
  assert.equal(
    response.result.structuredContent.profile.target,
    "google-slides",
  );
  const invalid = await rpc("tools/call", {
    name: tool.name,
    arguments: { target: "unknown" },
  });
  assert(invalid.error || invalid.result?.isError);
});
