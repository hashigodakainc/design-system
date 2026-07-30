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

const assetSource = JSON.parse(await readFile(resolve(root, "assets/manifest.json"), "utf8"));
const dataOutputPath = resolve(root, "guidelines/data.js");
const tokenMap = new Map(tokens.map((token) => [token.name, token]));

const resolveTokenValue = (name, trail = []) => {
  if (trail.includes(name)) throw new Error(`Circular reference: ${[...trail, name].join(" -> ")}`);
  const token = tokenMap.get(name);
  if (!token) throw new Error(`Unknown token: ${name}`);
  const reference = /^\{(.+)\}$/.exec(token.value);
  return reference ? resolveTokenValue(reference[1], [...trail, name]) : token.value;
};

const resolveAnyValue = (value) => {
  const reference = /^\{(.+)\}$/.exec(value);
  return reference ? resolveTokenValue(reference[1]) : value;
};

const exportTokens = (source) => source.tokens.map((token) => ({
  name: token.name,
  cssVar: cssName(token.name),
  value: token.value,
  resolved: resolveAnyValue(token.value),
  ...(token.description ? { description: token.description } : {}),
}));

const exportRole = (role) => ({
  name: role.name,
  fontSize: resolveAnyValue(role.fontSize),
  ...(role.mobileFontSize ? { mobileFontSize: resolveAnyValue(role.mobileFontSize) } : {}),
  fontWeight: role.fontWeight === "heading" ? "heading" : resolveAnyValue(role.fontWeight),
  lineHeight: resolveAnyValue(role.lineHeight),
  letterSpacing: resolveAnyValue(role.letterSpacing),
});

const data = {
  sources: [
    { id: "colors", label: "カラー", status: colorSource.status, pending: colorSource.pending ?? [] },
    { id: "typography", label: "タイポグラフィ", status: typographySource.status, pending: typographySource.pending ?? [] },
    { id: "layout", label: "レイアウト", status: layoutSource.status, pending: layoutSource.pending ?? [] },
  ],
  tokens: {
    colors: exportTokens(colorSource),
    typography: exportTokens(typographySource),
    layout: exportTokens(layoutSource),
  },
  typographyRoles: typographySource.roles.map(exportRole),
  assets: assetSource.assets.map((asset) => ({
    id: asset.id,
    kind: asset.kind,
    label: asset.label,
    status: asset.status,
    ...(asset.path ? { path: asset.path } : {}),
    ...(asset.usage ? { usage: asset.usage } : {}),
    ...(asset.restrictions ? { restrictions: asset.restrictions } : {}),
    pending: asset.pending ?? [],
  })),
};

const dataLines = [
  "/* Generated from tokens/*.json and assets/manifest.json. Do not edit directly. */",
  `window.HSG_DATA = ${JSON.stringify(data, null, 2)};`,
  "",
];
await writeFile(dataOutputPath, dataLines.join("\n"), "utf8");

console.log(`Generated ${outputPath}`);
console.log(`Generated ${typographyOutputPath}`);
console.log(`Generated ${dataOutputPath}`);
