import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const colorSource = JSON.parse(await readFile(resolve(root, "tokens/colors.json"), "utf8"));
const typographySource = JSON.parse(await readFile(resolve(root, "tokens/typography.json"), "utf8"));
const generatedCss = await readFile(resolve(root, "styles/tokens.css"), "utf8");
const generatedTypographyCss = await readFile(resolve(root, "styles/typography.css"), "utf8");
const componentCss = await readFile(resolve(root, "styles/components.css"), "utf8");
const exampleHtml = await readFile(resolve(root, "examples/color-foundations.html"), "utf8");
const guidelineHtml = await readFile(resolve(root, "guidelines/index.html"), "utf8");
const guidelineCss = await readFile(resolve(root, "guidelines/site.css"), "utf8");
const allTokens = [...colorSource.tokens, ...typographySource.tokens];
const tokens = new Map();
const failures = [];
const supportedTypes = new Set(["color", "fontFamily", "fontWeight", "dimension", "number", "letterSpacing"]);

for (const token of allTokens) {
  if (tokens.has(token.name)) failures.push(`Duplicate token: ${token.name}`);
  if (!supportedTypes.has(token.type)) failures.push(`Unsupported type for ${token.name}: ${token.type}`);
  tokens.set(token.name, token);
}

const cssName = (name) => `--hsg-${name.replaceAll(".", "-")}`;
const cssValue = (value) => {
  const match = /^\{(.+)\}$/.exec(value);
  return match ? `var(${cssName(match[1])})` : value;
};

for (const token of allTokens) {
  const declaration = `${cssName(token.name)}: ${cssValue(token.value)};`;
  if (!generatedCss.includes(declaration)) failures.push(`Generated CSS is stale or missing: ${token.name}`);
}

const combinedCss = `${generatedCss}\n${generatedTypographyCss}`;
for (const source of [exampleHtml, guidelineHtml, guidelineCss, componentCss]) {
  for (const match of source.matchAll(/var\((--hsg-[a-z0-9-]+)\)/g)) {
    if (!combinedCss.includes(`${match[1]}:`)) failures.push(`A consumer uses an unknown CSS variable: ${match[1]}`);
  }
}

const resolveValue = (name, trail = []) => {
  if (trail.includes(name)) throw new Error(`Circular reference: ${[...trail, name].join(" -> ")}`);
  const token = tokens.get(name);
  if (!token) throw new Error(`Unknown token: ${name}`);
  const reference = /^\{(.+)\}$/.exec(token.value);
  return reference ? resolveValue(reference[1], [...trail, name]) : token.value;
};

const resolveReference = (value) => {
  const reference = /^\{(.+)\}$/.exec(value);
  if (!reference) throw new Error(`Expected token reference: ${value}`);
  return resolveValue(reference[1]);
};

for (const token of allTokens) {
  try {
    resolveValue(token.name);
  } catch (error) {
    failures.push(error.message);
  }
}

const pairIds = new Set();
for (const pair of typographySource.fontPairs) {
  if (pairIds.has(pair.id)) failures.push(`Duplicate font pair: ${pair.id}`);
  pairIds.add(pair.id);
  try {
    resolveReference(pair.latinFamily);
    resolveReference(pair.bodyFamily);
    resolveReference(pair.headingWeight);
  } catch (error) {
    failures.push(error.message);
  }
  if (!generatedTypographyCss.includes(`[data-hsg-font-pair="${pair.id}"]`)) {
    failures.push(`Generated typography CSS is missing font pair: ${pair.id}`);
  }
}

const roleNames = new Set();
for (const role of typographySource.roles) {
  if (roleNames.has(role.name)) failures.push(`Duplicate typography role: ${role.name}`);
  roleNames.add(role.name);
  if (!["latin", "body", "code"].includes(role.family)) failures.push(`Unknown family role: ${role.family}`);
  try {
    resolveReference(role.fontSize);
    resolveReference(role.lineHeight);
    resolveReference(role.letterSpacing);
    if (role.mobileFontSize) resolveReference(role.mobileFontSize);
    if (role.fontWeight !== "heading") resolveReference(role.fontWeight);
  } catch (error) {
    failures.push(error.message);
  }
  if (!generatedTypographyCss.includes(`.hsg-type-${role.name} {`)) {
    failures.push(`Generated typography CSS is missing role: ${role.name}`);
  }
  if (!guidelineHtml.includes(`hsg-type-${role.name}`)) {
    failures.push(`Typography guideline is missing a specimen for role: ${role.name}`);
  }
}

const luminance = (hex) => {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) throw new Error(`Invalid color value: ${hex}`);
  const channels = hex.slice(1).match(/../g).map((channel) => parseInt(channel, 16) / 255);
  const linear = channels.map((channel) => channel <= 0.04045
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
};

const contrast = (foreground, background) => {
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
};

for (const check of colorSource.contrastChecks) {
  try {
    const ratio = contrast(resolveValue(check.foreground), resolveValue(check.background));
    if (ratio < check.minimum) {
      failures.push(`${check.foreground} on ${check.background}: ${ratio.toFixed(2)} < ${check.minimum}`);
    } else {
      console.log(`${check.foreground} on ${check.background}: ${ratio.toFixed(2)}:1`);
    }
  } catch (error) {
    failures.push(error.message);
  }
}

if (failures.length) {
  console.error([...new Set(failures)].join("\n"));
  process.exitCode = 1;
} else {
  console.log(`${colorSource.tokens.length} color tokens validated`);
  console.log(`${typographySource.tokens.length} typography tokens and ${typographySource.roles.length} roles validated`);
}
