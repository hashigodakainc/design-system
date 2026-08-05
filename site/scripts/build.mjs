import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { publicFiles, transformPublicFile } from './public-files.mjs';

const siteDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = path.resolve(siteDir, '..');
const distDir = path.join(siteDir, 'dist');

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

for (const [source, destination] of publicFiles) {
  const sourcePath = path.join(repositoryRoot, source);
  const destinationPath = path.join(distDir, destination);
  await mkdir(path.dirname(destinationPath), { recursive: true });

  const contents = await readFile(sourcePath);
  const transformed = transformPublicFile(source, contents);
  await writeFile(destinationPath, transformed);
}

console.log(`Built ${publicFiles.length} allowlisted files in ${path.relative(repositoryRoot, distDir)}/.`);
