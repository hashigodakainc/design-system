import assert from "node:assert/strict";
import { access, readdir } from "node:fs/promises";
import test from "node:test";

const publicArchive = new URL("../public/archive/2026-07-21/", import.meta.url);

test("publishes every archived comparison round from the design-system source", async () => {
  const entries = await readdir(publicArchive, { withFileTypes: true });
  const rounds = entries
    .filter((entry) => entry.isDirectory() && /^\d{2}-/.test(entry.name))
    .map((entry) => entry.name)
    .sort();

  assert.equal(rounds.length, 10);
  await Promise.all(rounds.map((round) => access(new URL(`${round}/index.html`, publicArchive))));
  await access(new URL("process-timeline/index.html", publicArchive));
  await access(new URL("assets/fonts/sora.ttf", publicArchive));
  await access(new URL("assets/licenses/sora-OFL.txt", publicArchive));
  await assert.rejects(access(new URL("diagnostics/font-candidate-loading.md", publicArchive)));
});
