import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const colorSource = JSON.parse(await readFile(resolve(root, "tokens/colors.json"), "utf8"));
const typographySource = JSON.parse(await readFile(resolve(root, "tokens/typography.json"), "utf8"));
const layoutSource = JSON.parse(await readFile(resolve(root, "tokens/layout.json"), "utf8"));
const outputPath = resolve(root, "styles/tokens.css");
const typographyOutputPath = resolve(root, "styles/typography.css");
const tokens = [...colorSource.tokens, ...typographySource.tokens, ...layoutSource.tokens];

const cssName = (name) => `--hsg-${name.replaceAll(".", "-")}`;
const cssValue = (value) => {
  const match = /^\{(.+)\}$/.exec(value);
  return match ? `var(${cssName(match[1])})` : value;
};

const lines = [
  "/* Generated from tokens/colors.json, tokens/typography.json, and tokens/layout.json. Do not edit directly. */",
  ":root {",
  ...tokens.map((token) => `  ${cssName(token.name)}: ${cssValue(token.value)};`),
  "}",
  "",
];

await writeFile(outputPath, lines.join("\n"), "utf8");

const referenceName = (value) => {
  const match = /^\{(.+)\}$/.exec(value);
  if (!match) throw new Error(`Typography role value must reference a token: ${value}`);
  return cssName(match[1]);
};

const pairLines = typographySource.fontPairs.flatMap((pair, index) => {
  const selectors = index === 0
    ? `:root, [data-hsg-font-pair="${pair.id}"]`
    : `[data-hsg-font-pair="${pair.id}"]`;
  return [
    `${selectors} {`,
    `  --hsg-typography-family-latin: var(${referenceName(pair.latinFamily)});`,
    `  --hsg-typography-family-body: var(${referenceName(pair.bodyFamily)});`,
    `  --hsg-typography-weight-heading: var(${referenceName(pair.headingWeight)});`,
    "}",
  ];
});

const familyValue = (role) => role.family === "code"
  ? `var(${cssName("typography.family.code")})`
  : `var(--hsg-typography-family-${role.family})`;
const weightValue = (role) => role.fontWeight === "heading"
  ? "var(--hsg-typography-weight-heading)"
  : `var(${referenceName(role.fontWeight)})`;

const roleLines = typographySource.roles.flatMap((role) => [
  `.hsg-type-${role.name} {`,
  `  font-family: ${familyValue(role)};`,
  `  font-size: var(${referenceName(role.fontSize)});`,
  `  font-weight: ${weightValue(role)};`,
  `  line-height: var(${referenceName(role.lineHeight)});`,
  `  letter-spacing: var(${referenceName(role.letterSpacing)});`,
  "}",
]);

const responsiveRoles = typographySource.roles.filter((role) => role.mobileFontSize);
const typographyLines = [
  "/* Generated from tokens/typography.json. Do not edit directly. */",
  ...pairLines,
  "",
  ...roleLines,
  "",
  "@media (max-width: 760px) {",
  ...responsiveRoles.map((role) => `  .hsg-type-${role.name} { font-size: var(${referenceName(role.mobileFontSize)}); }`),
  "}",
  "",
];

await writeFile(typographyOutputPath, typographyLines.join("\n"), "utf8");

console.log(`Generated ${outputPath}`);
console.log(`Generated ${typographyOutputPath}`);
