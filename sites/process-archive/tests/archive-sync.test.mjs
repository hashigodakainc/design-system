import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

const publicArchive = new URL("../public/archive/2026-07-21/", import.meta.url);
const publicSiteArchive = new URL("../public/archive/2026-07-22/", import.meta.url);

test("publishes every archived comparison round from the design-system source", async () => {
  const entries = await readdir(publicArchive, { withFileTypes: true });
  const rounds = entries
    .filter((entry) => entry.isDirectory() && /^\d{2}-/.test(entry.name))
    .map((entry) => entry.name)
    .sort();

  assert.equal(rounds.length, 11);
  await Promise.all(rounds.map((round) => access(new URL(`${round}/index.html`, publicArchive))));
  await access(new URL("process-timeline/index.html", publicArchive));
  await access(new URL("assets/fonts/sora.ttf", publicArchive));
  await access(new URL("assets/licenses/sora-OFL.txt", publicArchive));
  await assert.rejects(access(new URL("diagnostics/font-candidate-loading.md", publicArchive)));
});

test("publishes every corporate-site redesign comparison without localhost asset dependencies", async () => {
  const entries = await readdir(publicSiteArchive, { withFileTypes: true });
  const rounds = entries
    .filter((entry) => entry.isDirectory() && /^\d{2}-/.test(entry.name))
    .map((entry) => entry.name)
    .sort();

  assert.equal(rounds.length, 12);
  await Promise.all(rounds.map((round) => access(new URL(`${round}/index.html`, publicSiteArchive))));
  await access(new URL("process-timeline/index.html", publicSiteArchive));
  await access(new URL("assets/service-01-ai-multi-system.png", publicSiteArchive));

  const overviewHtml = await Promise.all([
    readFile(new URL("06-service-overview-diagram/index.html", publicSiteArchive), "utf8"),
    readFile(new URL("07-service-overview-geometry/index.html", publicSiteArchive), "utf8"),
    readFile(new URL("08-service-overview-active-state/index.html", publicSiteArchive), "utf8"),
  ]);
  assert.equal(overviewHtml.some((html) => html.includes("127.0.0.1")), false);
});

test("keeps reference company identities out of the public process narrative", async () => {
  const publicNarrative = await Promise.all([
    readFile(new URL("00-moodboard-direction/index.html", publicArchive), "utf8"),
    readFile(new URL("process-timeline/index.html", publicArchive), "utf8"),
  ]);
  const thirdPartyNames = [
    "KOTO", "PORTO ROCHA", "IDEO", "Goodpatch", "Ubie", "BIPROGY",
    "YOU TRUST", "MONSTAR LAB", "Studio Dumbar", "Vercel", "Sun Asterisk",
    "LayerX", "Helpfeel", "NTTデータ", "Fusic", "JDSC", "SPIKE STUDIO",
    "COLLINS", "KO Collective", "Anthropic", "Sakana AI", "NRI", "MIZUKARA",
    "Takram", "Linear", "IBM Design", "Sony Design", "Mercari",
  ];

  for (const name of thirdPartyNames) {
    assert.equal(publicNarrative.some((html) => html.includes(name)), false, `${name} must stay internal`);
  }
});
