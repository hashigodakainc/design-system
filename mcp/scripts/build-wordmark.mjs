import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import opentype from "opentype.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const fontPath = resolve(root, "assets/fonts/sora.ttf");
const manifestPath = resolve(root, "assets/manifest.json");
const colorsPath = resolve(root, "tokens/colors.json");
const typographyPath = resolve(root, "tokens/typography.json");
const outputPath = resolve(root, "assets/wordmarks/wordmark.svg");

const text = "Hashigodaka";
const weight = 700;
const precision = 3;

const [manifest, colors, typography] = await Promise.all(
  [manifestPath, colorsPath, typographyPath].map(async (path) =>
    JSON.parse(await readFile(path, "utf8")),
  ),
);

const wordmarkAsset = manifest.assets.find((asset) => asset.id === "wordmark");
if (!wordmarkAsset?.defaultColor) {
  throw new Error(
    "wordmark.defaultColor is missing from assets/manifest.json",
  );
}

const colorTokens = new Map(
  colors.tokens.map((token) => [token.name, token.value]),
);
const resolveColor = (value, references = []) => {
  const match = /^\{([^{}]+)\}$/.exec(value);
  if (!match) {
    return value;
  }

  const tokenName = match[1];
  if (references.includes(tokenName)) {
    throw new Error(
      `Circular color token reference: ${[...references, tokenName].join(" -> ")}`,
    );
  }

  const tokenValue = colorTokens.get(tokenName);
  if (tokenValue === undefined) {
    throw new Error(
      `Color token "${tokenName}" referenced by wordmark.defaultColor is missing from tokens/colors.json`,
    );
  }

  return resolveColor(tokenValue, [...references, tokenName]);
};
const defaultColor = resolveColor(wordmarkAsset.defaultColor);

const letterSpacingToken = typography.tokens.find(
  (token) => token.name === "typography.letter-spacing.heading",
);

if (!letterSpacingToken) {
  throw new Error(
    "typography.letter-spacing.heading is missing from tokens/typography.json",
  );
}

const letterSpacingMatch = /^(-?(?:\d+|\d*\.\d+))em$/.exec(
  letterSpacingToken.value,
);
if (!letterSpacingMatch) {
  throw new Error(
    `Expected typography.letter-spacing.heading to use em units, received "${letterSpacingToken.value}"`,
  );
}
const letterSpacing = Number(letterSpacingMatch[1]);

const fontBuffer = await readFile(fontPath);
const fontArrayBuffer = fontBuffer.buffer.slice(
  fontBuffer.byteOffset,
  fontBuffer.byteOffset + fontBuffer.byteLength,
);
const font = opentype.parse(fontArrayBuffer);
const weightAxis = font.tables.fvar?.axes?.find((axis) => axis.tag === "wght");

if (
  !weightAxis ||
  weight < weightAxis.minValue ||
  weight > weightAxis.maxValue ||
  !font.variation
) {
  throw new Error("Sora does not expose a usable variable wght axis.");
}

font.variation.set({ wght: weight });

const fontSize = font.unitsPerEm;
const renderOptions = {
  kerning: true,
  letterSpacing,
  variation: { wght: weight },
};
const initialPath = font.getPath(text, 0, 0, fontSize, renderOptions);
const initialBox = initialPath.getBoundingBox();
const fittedPath = font.getPath(
  text,
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

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" color="${defaultColor}" role="img" aria-labelledby="wordmark-title wordmark-desc">
  <title id="wordmark-title">Hashigodaka wordmark</title>
  <desc id="wordmark-desc">Hashigodaka set in Sora Bold.</desc>
  <path fill="currentColor" d="${pathData}"/>
</svg>
`;

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, svg);

console.log(
  `wordmark: Sora variable font wght=${weight} (axis ${weightAxis.minValue}-${weightAxis.maxValue})`,
);
console.log(
  `wordmark: defaultColor=${wordmarkAsset.defaultColor} -> ${defaultColor}`,
);
console.log(`wordmark: letter-spacing=${letterSpacingToken.value}`);
console.log(`wordmark: viewBox="${viewBox}"`);
