import { access, cp, readdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const archiveSource = resolve(siteRoot, "..", "..", "process-archive", "2026-07-21");
const archiveOutput = resolve(siteRoot, "public", "archive", "2026-07-21");

await access(resolve(archiveSource, "README.md"));
const rounds = (await readdir(archiveSource, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory() && /^\d{2}-/.test(entry.name));

if (rounds.length !== 11) {
  throw new Error(`Expected 11 archive rounds in ${archiveSource}, found ${rounds.length}`);
}

await rm(archiveOutput, { recursive: true, force: true });
await cp(archiveSource, archiveOutput, { recursive: true });
await rm(resolve(archiveOutput, "diagnostics"), { recursive: true, force: true });

console.log(`Synced ${rounds.length} rounds and excluded internal diagnostics`);
