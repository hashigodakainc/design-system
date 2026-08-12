import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(
  await readFile(resolve(root, "assets/manifest.json"), "utf8"),
);
const favicon = manifest.assets.find((asset) => asset.id === "icon.favicon");
if (!favicon) throw new Error('Asset "icon.favicon" is missing from assets/manifest.json');

const sourceAssetId = favicon.generator?.sourceAsset;
const sourceAsset = manifest.assets.find((asset) => asset.id === sourceAssetId);
if (!sourceAsset) {
  throw new Error(`Favicon source asset "${sourceAssetId}" is missing from assets/manifest.json`);
}

for (const [label, path] of [
  ["icon.favicon.path", favicon.path],
  [`${sourceAssetId}.path`, sourceAsset.path],
]) {
  if (typeof path !== "string" || !path.startsWith("assets/") || path.includes("..")) {
    throw new Error(`${label} must be a safe assets/ path`);
  }
}
if (favicon.format !== "image/svg+xml" || sourceAsset.format !== "image/svg+xml") {
  throw new Error("Favicon and its source asset must both be SVG");
}

const source = await readFile(resolve(root, sourceAsset.path), "utf8");
const viewBox = source.match(/\bviewBox="([^"]+)"/)?.[1];
const color = source.match(/\bcolor="([^"]+)"/)?.[1];
const path = source.match(/<path\b[^>]*\bfill="currentColor"[^>]*\bd="([^"]+)"[^>]*\/?\s*>/)?.[1];
if (!viewBox || !color || !path) {
  throw new Error(`${sourceAsset.path} must define viewBox, color, and a currentColor path`);
}
if (favicon.viewBox !== viewBox) {
  throw new Error(`icon.favicon.viewBox must match ${sourceAssetId}: "${viewBox}"`);
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" color="${color}" role="img" aria-labelledby="favicon-title">
  <title id="favicon-title">Hashigodaka</title>
  <path fill="currentColor" d="${path}"/>
</svg>
`;

const output = resolve(root, favicon.path);
await mkdir(dirname(output), { recursive: true });
await writeFile(output, svg);
console.log(`Built ${favicon.path} from ${sourceAsset.path}.`);
