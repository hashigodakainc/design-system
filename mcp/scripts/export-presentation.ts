import { writeFile } from "node:fs/promises";
import snapshot from "../src/generated/design-snapshot.json" with { type: "json" };
import { SnapshotRepositoryLoader } from "../src/loaders/snapshot.js";
import type { DesignSystemSnapshot } from "../src/snapshot.js";
import { getPresentationProfile } from "../src/presentation.js";
const output = process.argv[2];
if (!output)
  throw new Error(
    "Usage: node --import tsx scripts/export-presentation.ts output.json (run build:snapshot first)",
  );
const repository = new SnapshotRepositoryLoader(
  snapshot as DesignSystemSnapshot,
  { assetBaseUrl: "https://design.hashigodaka.co.jp" },
).load();
await writeFile(
  output,
  `${JSON.stringify(getPresentationProfile(repository), null, 2)}\n`,
);
