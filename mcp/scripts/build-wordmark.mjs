import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import opentype from "opentype.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const fontPath = resolve(root, "assets/fonts/sora.ttf");
const typographyPath = resolve(root, "tokens/typography.json");
const outputPath = resolve(root, "assets/wordmarks/wordmark.svg");

const text = "Hashigodaka";
const weight = 700;
const precision = 3;

const typography = JSON.parse(await readFile(typographyPath, "utf8"));
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

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-labelledby="title desc">
  <title id="title">Hashigodaka wordmark</title>
  <desc id="desc">Hashigodaka set in Sora Bold.</desc>
  <path fill="currentColor" d="${pathData}"/>
</svg>
`;

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, svg);

console.log(
  `wordmark: Sora variable font wght=${weight} (axis ${weightAxis.minValue}-${weightAxis.maxValue})`,
);
console.log(`wordmark: letter-spacing=${letterSpacingToken.value}`);
console.log(`wordmark: viewBox="${viewBox}"`);
