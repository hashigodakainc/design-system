import { lstat, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { publicFiles, transformPublicFile } from './public-files.mjs';

const siteDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = path.resolve(siteDir, '..');
const distDir = path.join(siteDir, 'dist');
const expectedFiles = new Set(publicFiles.map(([, destination]) => destination));
const errors = [];

const walk = async (directory, prefix = '') => {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relativePath = path.posix.join(prefix, entry.name);
    const absolutePath = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) {
      errors.push(`Symbolic links are not allowed in dist: ${relativePath}`);
    } else if (entry.isDirectory()) {
      files.push(...await walk(absolutePath, relativePath));
    } else if (entry.isFile()) {
      files.push(relativePath);
    } else {
      errors.push(`Unsupported dist entry: ${relativePath}`);
    }
  }
  return files;
};

const actualFiles = new Set(await walk(distDir));
for (const expected of expectedFiles) {
  if (!actualFiles.has(expected)) errors.push(`Missing public file: ${expected}`);
}
for (const actual of actualFiles) {
  if (!expectedFiles.has(actual)) errors.push(`Non-allowlisted public file: ${actual}`);
}

for (const [source, destination] of publicFiles) {
  if (!actualFiles.has(destination)) continue;
  const sourceContents = await readFile(path.join(repositoryRoot, source));
  const expectedContents = transformPublicFile(source, sourceContents);
  const actualContents = await readFile(path.join(distDir, destination));
  if (!actualContents.equals(expectedContents)) {
    errors.push(`Public file does not match its SSOT source: ${destination}`);
  }
  const stat = await lstat(path.join(distDir, destination));
  if (!stat.isFile()) errors.push(`Public path is not a regular file: ${destination}`);
}

for (const jsonFile of [...actualFiles].filter((file) => file.endsWith('.json'))) {
  try {
    JSON.parse(await readFile(path.join(distDir, jsonFile), 'utf8'));
  } catch (error) {
    errors.push(`Invalid JSON in ${jsonFile}: ${error.message}`);
  }
}

const referencedPaths = new Set();
const addReference = (from, reference) => {
  if (/^(?:#|data:|https?:|mailto:|tel:)/.test(reference)) return;
  const withoutQuery = reference.split(/[?#]/, 1)[0];
  referencedPaths.add(path.posix.normalize(path.posix.join(path.posix.dirname(from), withoutQuery)));
};

const html = await readFile(path.join(distDir, 'index.html'), 'utf8');
if (!html.includes('<link rel="icon" href="assets/motifs/brand-motif.svg" type="image/svg+xml">')) {
  errors.push('Site favicon must reference the public brand motif SVG.');
}
for (const requiredMetadata of [
  '<link rel="canonical" href="https://design.hashigodaka.co.jp/">',
  '<meta property="og:locale" content="ja_JP">',
  '<meta property="og:url" content="https://design.hashigodaka.co.jp/">',
  '<meta property="og:image" content="https://design.hashigodaka.co.jp/assets/social/design-system-og.png">',
  '<meta property="og:image:type" content="image/png">',
  '<meta property="og:image:width" content="1200">',
  '<meta property="og:image:height" content="630">',
  '<meta name="twitter:card" content="summary_large_image">',
]) {
  if (!html.includes(requiredMetadata)) errors.push(`Missing social metadata: ${requiredMetadata}`);
}
for (const match of html.matchAll(/\b(?:href|src)=(['"])(.*?)\1/g)) addReference('index.html', match[2]);
for (const cssFile of [...actualFiles].filter((file) => file.endsWith('.css'))) {
  const css = await readFile(path.join(distDir, cssFile), 'utf8');
  for (const match of css.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/g)) addReference(cssFile, match[2]);
}
const script = await readFile(path.join(distDir, 'site.js'), 'utf8');
for (const match of script.matchAll(/fetchJson\((['"])(.*?)\1\)/g)) addReference('site.js', match[2]);

for (const reference of referencedPaths) {
  if (!actualFiles.has(reference)) errors.push(`Broken public reference: ${reference}`);
  if (reference.startsWith('../') || path.isAbsolute(reference)) errors.push(`Reference escapes dist: ${reference}`);
}

const headers = await readFile(path.join(distDir, '_headers'), 'utf8');
for (const requiredHeader of [
  'Content-Security-Policy:',
  "frame-ancestors 'none'",
  'Referrer-Policy:',
  'X-Content-Type-Options: nosniff',
  'X-Frame-Options: DENY',
]) {
  if (!headers.includes(requiredHeader)) errors.push(`Missing security header directive: ${requiredHeader}`);
}

const forbiddenSegments = ['.git', 'AGENTS.md', 'mcp/', 'node_modules/', 'scripts/', 'wrangler.jsonc', 'package.json'];
for (const file of actualFiles) {
  if (forbiddenSegments.some((segment) => file === segment || file.startsWith(segment))) {
    errors.push(`Sensitive or adapter-only path is public: ${file}`);
  }
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Checked ${actualFiles.size} public files: allowlist, SSOT parity, references, JSON, and headers are valid.`);
}
