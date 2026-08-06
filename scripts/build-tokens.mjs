import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { validateTokenLayers } from "./color-layer-rules.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const colorSource = JSON.parse(await readFile(resolve(root, "tokens/colors.json"), "utf8"));
const typographySource = JSON.parse(await readFile(resolve(root, "tokens/typography.json"), "utf8"));
const layoutSource = JSON.parse(await readFile(resolve(root, "tokens/layout.json"), "utf8"));
const shapeSource = JSON.parse(await readFile(resolve(root, "tokens/shape.json"), "utf8"));
const componentSource = JSON.parse(await readFile(resolve(root, "tokens/components.json"), "utf8"));
const outputPath = resolve(root, "styles/tokens.css");
const typographyOutputPath = resolve(root, "styles/typography.css");
const tokens = [
  ...colorSource.tokens,
  ...typographySource.tokens,
  ...layoutSource.tokens,
  ...shapeSource.tokens,
  ...componentSource.tokens,
];

const layerValidation = validateTokenLayers({ colorSource, componentSource, typographySource, layoutSource, shapeSource });
for (const warning of layerValidation.warnings) console.warn(`Warning: ${warning}`);
if (layerValidation.errors.length) {
  throw new Error(layerValidation.errors.join("\n"));
}

const cssName = (name) => `--hsg-${name.replaceAll(".", "-")}`;
const cssValue = (value) => {
  const match = /^\{(.+)\}$/.exec(value);
  return match ? `var(${cssName(match[1])})` : value;
};
const tokenByName = new Map(tokens.map((token) => [token.name, token]));
const resolveValue = (name, trail = []) => {
  if (trail.includes(name)) throw new Error(`Circular token reference: ${[...trail, name].join(" -> ")}`);
  const token = tokenByName.get(name);
  if (!token) throw new Error(`Unknown token: ${name}`);
  const reference = /^\{(.+)\}$/.exec(token.value);
  return reference ? resolveValue(reference[1], [...trail, name]) : token.value;
};
const cssTokens = tokens.filter((token) => !token.name.startsWith("layout.breakpoint."));

const lines = [
  "/* Generated from tokens/colors.json, tokens/typography.json, tokens/layout.json, tokens/shape.json, and tokens/components.json. Do not edit directly. */",
  ":root {",
  ...cssTokens.map((token) => `  ${cssName(token.name)}: ${cssValue(token.value)};`),
  "}",
  "",
];

await writeFile(outputPath, lines.join("\n"), "utf8");

const referenceName = (value) => {
  const match = /^\{(.+)\}$/.exec(value);
  if (!match) throw new Error(`Typography role value must reference a token: ${value}`);
  return cssName(match[1]);
};

const roleLines = typographySource.roles.flatMap((role) => [
  `.hsg-type-${role.name} {`,
  `  font-family: var(${cssName(`typography.family.${role.family}`)});`,
  `  font-size: var(${referenceName(role.fontSize)});`,
  `  font-weight: var(${referenceName(role.fontWeight)});`,
  `  line-height: var(${referenceName(role.lineHeight)});`,
  `  letter-spacing: var(${referenceName(role.letterSpacing)});`,
  "}",
]);

const responsiveRoles = typographySource.roles.filter((role) => role.mobileFontSize);
const mobileBreakpoint = resolveValue("layout.breakpoint.mobile-max");
const typographyLines = [
  "/* Generated from tokens/typography.json. Do not edit directly. */",
  ...roleLines,
  "",
  `@media (max-width: ${mobileBreakpoint}) {`,
  ...responsiveRoles.map((role) => `  .hsg-type-${role.name} { font-size: var(${referenceName(role.mobileFontSize)}); }`),
  "}",
  "",
];

await writeFile(typographyOutputPath, typographyLines.join("\n"), "utf8");

console.log(`Generated ${outputPath}`);
console.log(`Generated ${typographyOutputPath}`);
