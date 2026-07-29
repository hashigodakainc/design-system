import { access, cp, readdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const archiveRoot = resolve(siteRoot, "..", "..", "process-archive");
const archiveOutputRoot = resolve(siteRoot, "public", "archive");
const archives = [
  { date: "2026-07-21", rounds: 11 },
  { date: "2026-07-22", rounds: 12 },
  { date: "2026-07-24", rounds: 3 },
  { date: "2026-07-28", rounds: 13 },
];

await rm(archiveOutputRoot, { recursive: true, force: true });

for (const archive of archives) {
  const archiveSource = resolve(archiveRoot, archive.date);
  const archiveOutput = resolve(archiveOutputRoot, archive.date);
  await access(resolve(archiveSource, "README.md"));
  const rounds = (await readdir(archiveSource, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && /^\d{2}-/.test(entry.name));

  if (rounds.length !== archive.rounds) {
    throw new Error(`Expected ${archive.rounds} archive rounds in ${archiveSource}, found ${rounds.length}`);
  }

  await cp(archiveSource, archiveOutput, { recursive: true });
  await rm(resolve(archiveOutput, "diagnostics"), { recursive: true, force: true });
  console.log(`Synced ${rounds.length} rounds from ${archive.date}`);
}
