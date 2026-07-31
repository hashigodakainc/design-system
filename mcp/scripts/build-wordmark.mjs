import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import opentype from "opentype.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const manifestPath = resolve(root, "assets/manifest.json");
const colorsPath = resolve(root, "tokens/colors.json");
const typographyPath = resolve(root, "tokens/typography.json");
const precision = 3;

const [manifest, colors, typography] = await Promise.all(
  [manifestPath, colorsPath, typographyPath].map(async (path) =>
    JSON.parse(await readFile(path, "utf8")),
  ),
);

const wordmarkAsset = manifest.assets.find((asset) => asset.id === "wordmark");
if (!wordmarkAsset) {
  throw new Error('Asset "wordmark" is missing from assets/manifest.json');
}
if (!wordmarkAsset.defaultColor) {
  throw new Error(
    "wordmark.defaultColor is missing from assets/manifest.json",
  );
}
if (!wordmarkAsset.path) {
  throw new Error("wordmark.path is missing from assets/manifest.json");
}

const generator = wordmarkAsset.generator;
if (
  !generator ||
  typeof generator.text !== "string" ||
  !generator.text ||
  typeof generator.font !== "string" ||
  !generator.font ||
  typeof generator.weight !== "number" ||
  typeof generator.letterSpacing !== "string"
) {
  throw new Error(
    "wordmark.generator must define text, font, weight, and letterSpacing in assets/manifest.json",
  );
}

for (const [label, path] of [
  ["wordmark.path", wordmarkAsset.path],
  ["wordmark.generator.font", generator.font],
]) {
  if (!path.startsWith("assets/") || path.includes("..")) {
    throw new Error(`${label} must be a safe assets/ path, received "${path}"`);
  }
}

const resolveToken = (value, tokens, context, references = []) => {
  const match = /^\{([^{}]+)\}$/.exec(value);
  if (!match) return value;

  const tokenName = match[1];
  if (references.includes(tokenName)) {
    throw new Error(
      `Circular token reference: ${[...references, tokenName].join(" -> ")}`,
    );
  }
  const tokenValue = tokens.get(tokenName);
  if (tokenValue === undefined) {
    throw new Error(
      `Token "${tokenName}" referenced by ${context} is missing`,
    );
  }
  return resolveToken(tokenValue, tokens, context, [...references, tokenName]);
};

const colorTokens = new Map(
  colors.tokens.map((token) => [token.name, token.value]),
);
const defaultColor = resolveToken(
  wordmarkAsset.defaultColor,
  colorTokens,
  "wordmark.defaultColor",
);

if (!/^\{[^{}]+\}$/.test(generator.letterSpacing)) {
  throw new Error(
    `wordmark.generator.letterSpacing must be a token reference, received "${generator.letterSpacing}"`,
  );
}
const typographyTokens = new Map(
  typography.tokens.map((token) => [token.name, token.value]),
);
const letterSpacingValue = resolveToken(
  generator.letterSpacing,
  typographyTokens,
  "wordmark.generator.letterSpacing",
);
const letterSpacingMatch = /^(-?(?:\d+|\d*\.\d+))em$/.exec(
  letterSpacingValue,
);
if (!letterSpacingMatch) {
  throw new Error(
    `Expected wordmark.generator.letterSpacing to resolve to em units, received "${letterSpacingValue}"`,
  );
}
const letterSpacing = Number(letterSpacingMatch[1]);

const fontPath = resolve(root, generator.font);
const outputPath = resolve(root, wordmarkAsset.path);
const fontBuffer = await readFile(fontPath);
const fontArrayBuffer = fontBuffer.buffer.slice(
  fontBuffer.byteOffset,
  fontBuffer.byteOffset + fontBuffer.byteLength,
);
const font = opentype.parse(fontArrayBuffer);
const weightAxis = font.tables.fvar?.axes?.find((axis) => axis.tag === "wght");

if (
  !weightAxis ||
  generator.weight < weightAxis.minValue ||
  generator.weight > weightAxis.maxValue ||
  !font.variation
) {
  throw new Error(
    `${generator.font} does not expose a usable variable wght axis for weight ${generator.weight}.`,
  );
}

font.variation.set({ wght: generator.weight });

const fontSize = font.unitsPerEm;
const renderOptions = {
  kerning: true,
  letterSpacing,
  variation: { wght: generator.weight },
};
const initialPath = font.getPath(
  generator.text,
  0,
  0,
  fontSize,
  renderOptions,
);
const initialBox = initialPath.getBoundingBox();
const fittedPath = font.getPath(
  generator.text,
  -initialBox.x1,
  -initialBox.y1,
  fontSize,
  renderOptions,
);
const fittedBox = fittedPath.getBoundingBox();
const ceilToPrecision = (value) => {
  const factor = 10 ** precision;
  return Math.ceil(value * factor) / factor;
};
const formatNumber = (value) =>
  String(Number(ceilToPrecision(value).toFixed(precision)));
const width = formatNumber(fittedBox.x2 - fittedBox.x1);
const height = formatNumber(fittedBox.y2 - fittedBox.y1);
const viewBox = `0 0 ${width} ${height}`;
const pathData = fittedPath.toPathData({
  decimalPlaces: precision,
  flipY: false,
  optimize: true,
});
const escapeXml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
const escapedText = escapeXml(generator.text);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" color="${defaultColor}" role="img" aria-labelledby="wordmark-title wordmark-desc">
  <title id="wordmark-title">${escapedText} wordmark</title>
  <desc id="wordmark-desc">${escapedText} wordmark.</desc>
  <path fill="currentColor" d="${pathData}"/>
</svg>
`;

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, svg);
wordmarkAsset.viewBox = viewBox;
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(
  `wordmark: ${generator.font} variable font wght=${generator.weight} (axis ${weightAxis.minValue}-${weightAxis.maxValue})`,
);
console.log(
  `wordmark: defaultColor=${wordmarkAsset.defaultColor} -> ${defaultColor}`,
);
console.log(
  `wordmark: letter-spacing=${generator.letterSpacing} -> ${letterSpacingValue}`,
);
console.log(`wordmark: viewBox="${viewBox}"`);
