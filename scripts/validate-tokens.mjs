import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { validateTokenLayers } from "./color-layer-rules.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const colorSource = JSON.parse(await readFile(resolve(root, "tokens/colors.json"), "utf8"));
const typographySource = JSON.parse(await readFile(resolve(root, "tokens/typography.json"), "utf8"));
const layoutSource = JSON.parse(await readFile(resolve(root, "tokens/layout.json"), "utf8"));
const shapeSource = JSON.parse(await readFile(resolve(root, "tokens/shape.json"), "utf8"));
const componentSource = JSON.parse(await readFile(resolve(root, "tokens/components.json"), "utf8"));
const assetSource = JSON.parse(await readFile(resolve(root, "assets/manifest.json"), "utf8"));
const generatedCss = await readFile(resolve(root, "styles/tokens.css"), "utf8");
const generatedTypographyCss = await readFile(resolve(root, "styles/typography.css"), "utf8");
const componentCss = await readFile(resolve(root, "styles/components.css"), "utf8");
const guidelineHtml = await readFile(resolve(root, "site/src/index.html"), "utf8");
const guidelineCss = await readFile(resolve(root, "site/src/site.css"), "utf8");
const allTokens = [
  ...colorSource.tokens,
  ...typographySource.tokens,
  ...layoutSource.tokens,
  ...shapeSource.tokens,
  ...componentSource.tokens,
];
const tokens = new Map();
const failures = [];
const supportedTypes = new Set(["color", "fontFamily", "fontWeight", "dimension", "number", "letterSpacing"]);

const layerValidation = validateTokenLayers({ colorSource, componentSource, typographySource, layoutSource, shapeSource });
failures.push(...layerValidation.errors);
for (const warning of layerValidation.warnings) console.warn(`Warning: ${warning}`);

for (const token of allTokens) {
  if (tokens.has(token.name)) failures.push(`Duplicate token: ${token.name}`);
  if (!supportedTypes.has(token.type)) failures.push(`Unsupported type for ${token.name}: ${token.type}`);
  if (typeof token.description !== "string" || !token.description.trim()) {
    failures.push(`Token description is required: ${token.name}`);
  }
  tokens.set(token.name, token);
}

const cssName = (name) => `--hsg-${name.replaceAll(".", "-")}`;
const cssValue = (value) => {
  const match = /^\{(.+)\}$/.exec(value);
  return match ? `var(${cssName(match[1])})` : value;
};

for (const token of allTokens) {
  if (token.name.startsWith("layout.breakpoint.")) continue;
  const declaration = `${cssName(token.name)}: ${cssValue(token.value)};`;
  if (!generatedCss.includes(declaration)) failures.push(`Generated CSS is stale or missing: ${token.name}`);
}
for (const token of layoutSource.tokens.filter((token) => token.name.startsWith("layout.breakpoint."))) {
  if (generatedCss.includes(`${cssName(token.name)}:`)) {
    failures.push(`Breakpoint must not be emitted as a CSS variable: ${token.name}`);
  }
}

const combinedCss = `${generatedCss}\n${generatedTypographyCss}`;
for (const source of [guidelineHtml, guidelineCss, componentCss]) {
  for (const match of source.matchAll(/var\(\s*(--hsg-[a-z0-9-]+)(?:\s*,[^)]*)?\s*\)/g)) {
    if (!combinedCss.includes(`${match[1]}:`)) failures.push(`A consumer uses an unknown CSS variable: ${match[1]}`);
  }
}

const primitiveCssNames = new Set(
  colorSource.tokens
    .filter((token) => token.layer === "primitive")
    .map((token) => cssName(token.name)),
);
for (const [label, source] of [
  ["site/src/index.html", guidelineHtml],
  ["site/src/site.css", guidelineCss],
  ["styles/components.css", componentCss],
]) {
  for (const match of source.matchAll(/var\(\s*(--hsg-color-[a-z0-9-]+)(?:\s*,[^)]*)?\s*\)/g)) {
    if (primitiveCssNames.has(match[1])) failures.push(`${label} directly uses primitive color variable: ${match[1]}`);
  }
}

for (const [label, source] of [
  ["site/src/site.css", guidelineCss],
  ["styles/components.css", componentCss],
]) {
  if (/\bborder(?:-(?:top|right|bottom|left))?\s*:\s*\d+(?:\.\d+)?px\b/i.test(source)) {
    failures.push(`${label} contains a raw border width; use border.width.* token`);
  }
}

for (const className of [
  "hsg-card",
  "hsg-card-raised",
  "hsg-card-sunken",
]) {
  if (!componentCss.includes(`.${className}`)) failures.push(`Component stylesheet is missing .${className}`);
  if (!guidelineHtml.includes(className)) failures.push(`Site is missing a specimen for .${className}`);
}
const guidelineCardClasses = [...guidelineHtml.matchAll(/class="([^"]+)"/g)]
  .map((match) => match[1].split(/\s+/))
  .filter((classes) => classes.includes("hsg-card"));
for (const classes of guidelineCardClasses) {
  const modifiers = ["hsg-card-raised", "hsg-card-sunken"].filter((name) => classes.includes(name));
  if (modifiers.length !== 1) failures.push(`Site card must use exactly one surface modifier: ${classes.join(" ")}`);
}
for (const tokenName of [
  "color.border.default",
  "color.border.emphasis",
  "card.foreground",
  "card.raised.background",
  "card.raised.border",
  "card.sunken.background",
]) {
  if (!tokens.has(tokenName)) failures.push(`Card component token is missing: ${tokenName}`);
}

for (const className of ["hsg-menu", "hsg-menu-item", "hsg-menu-icon"]) {
  if (!componentCss.includes(`.${className}`)) failures.push(`Component stylesheet is missing .${className}`);
  if (!guidelineHtml.includes(className)) failures.push(`Site is missing a specimen for .${className}`);
}
for (const tokenName of [
  "menu.foreground",
  "menu.disabled.foreground",
  "menu.hover.foreground",
  "menu.active.foreground",
  "menu.active.indicator",
  "menu.divider",
]) {
  if (!tokens.has(tokenName)) failures.push(`Menu component token is missing: ${tokenName}`);
}
if (tokens.get("menu.active.indicator")?.value !== "{color.brand.primary}") {
  failures.push("Menu active indicator must reference color.brand.primary");
}
if (tokens.get("menu.disabled.foreground")?.value !== "{color.text.disabled}") {
  failures.push("Menu disabled foreground must reference color.text.disabled");
}
if (!componentCss.includes('.hsg-menu-item[aria-disabled="true"]')) {
  failures.push("Menu stylesheet must define aria-disabled state");
}
const guidelineMenuItems = [...guidelineHtml.matchAll(/<(?:a|span) class="[^"]*hsg-menu-item[^"]*"[^>]*>/g)];
if (guidelineMenuItems.filter(([tag]) => tag.includes('aria-current="page"')).length !== 1) {
  failures.push('Site menu must have exactly one aria-current="page" item');
}
const disabledMenuItems = guidelineMenuItems.filter(([tag]) => tag.includes('aria-disabled="true"'));
if (disabledMenuItems.length !== 1) failures.push("Site menu must have exactly one disabled item");
for (const [tag] of disabledMenuItems) {
  if (tag.startsWith("<a ") || tag.includes("href=") || tag.includes("tabindex=") || tag.includes("aria-current=")) {
    failures.push("Disabled site menu item must not be a link, focusable, or current");
  }
}

for (const className of ["hsg-badge-neutral-raised", "hsg-badge-neutral-sunken"]) {
  if (!componentCss.includes(`.${className}`)) failures.push(`Component stylesheet is missing .${className}`);
  if (!guidelineHtml.includes(className)) failures.push(`Site is missing a specimen for .${className}`);
}
if (componentCss.includes(".hsg-badge-neutral {")) failures.push("Legacy .hsg-badge-neutral class must not be restored");

for (const status of ["success", "warning", "error", "info"]) {
  const tokenName = `color.status.${status}.border`;
  if (tokens.has(tokenName)) failures.push(`Status colors must not define component borders: ${tokenName}`);
}

for (const [label, source] of [
  ["site/src/index.html", guidelineHtml],
  ["site/src/site.css", guidelineCss],
  ["styles/components.css", componentCss],
]) {
  if (/#[0-9a-f]{3,8}\b/i.test(source) || /%23[0-9a-f]{3,8}\b/i.test(source) || /\brgba?\(/i.test(source)) {
    failures.push(`${label} contains a raw color value; use a semantic or component token`);
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

const mobileBreakpoint = resolveValue("layout.breakpoint.mobile-max");
if (!generatedTypographyCss.includes(`@media (max-width: ${mobileBreakpoint}) {`)) {
  failures.push("Generated typography media query does not match layout.breakpoint.mobile-max");
}

const legacyTokenPatterns = [
  /^space\./,
  /^typography\.size\.(?:display|heading|body|label|label-large|caption|code)(?:\.|$)/,
  /^typography\.weight\.(?:heading|body|emphasis)$/,
  /^typography\.line-height\.(?:display|heading|body|compact|code)$/,
  /^typography\.letter-spacing\./,
  /^layout\.breakpoint\.(?:mobile|tablet|wide)$/,
  /^layout\.mobile-header\./,
];
for (const token of allTokens) {
  if (legacyTokenPatterns.some((pattern) => pattern.test(token.name))) {
    failures.push(`Legacy token must not be reintroduced during the migration release: ${token.name}`);
  }
}
const legacyCssVariablePatterns = [
  /--hsg-space-/,
  /--hsg-typography-size-(?:display|heading|body|label|caption|code)(?:-|\b)/,
  /--hsg-typography-weight-(?:heading|body|emphasis)\b/,
  /--hsg-typography-line-height-(?:display|heading|body|compact|code)\b/,
  /--hsg-typography-letter-spacing-/,
  /--hsg-layout-breakpoint-/,
  /--hsg-layout-mobile-header-/,
];
for (const [label, source] of [
  ["styles/tokens.css", generatedCss],
  ["styles/typography.css", generatedTypographyCss],
  ["styles/components.css", componentCss],
  ["site/src/index.html", guidelineHtml],
  ["site/src/site.css", guidelineCss],
]) {
  for (const pattern of legacyCssVariablePatterns) {
    if (pattern.test(source)) failures.push(`${label} uses a legacy CSS variable: ${pattern}`);
  }
}

for (const token of allTokens) {
  try {
    resolveValue(token.name);
  } catch (error) {
    failures.push(error.message);
  }
}

const roleNames = new Set();
for (const role of typographySource.roles) {
  if (roleNames.has(role.name)) failures.push(`Duplicate typography role: ${role.name}`);
  roleNames.add(role.name);
  if (!["latin", "body", "code"].includes(role.family)) failures.push(`Unknown family role: ${role.family}`);
  try {
    resolveValue(`typography.family.${role.family}`);
    resolveReference(role.fontSize);
    resolveReference(role.lineHeight);
    resolveReference(role.letterSpacing);
    if (role.mobileFontSize) resolveReference(role.mobileFontSize);
    resolveReference(role.fontWeight);
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

const assetStatuses = new Set(["candidate", "selected", "approved", "deprecated", "undecided"]);
const assetIds = new Set();
for (const asset of assetSource.assets) {
  if (assetIds.has(asset.id)) failures.push(`Duplicate asset: ${asset.id}`);
  assetIds.add(asset.id);
  if (!assetStatuses.has(asset.status)) failures.push(`Unknown asset status: ${asset.id}`);
  if (asset.status === "undecided") {
    if (asset.path) failures.push(`Undecided asset must not have a path: ${asset.id}`);
    if (!asset.pending?.length) failures.push(`Undecided asset must declare pending: ${asset.id}`);
    continue;
  }
  const assetFiles = [asset.path, asset.license, ...(asset.variants ?? [])].filter(Boolean);
  for (const file of assetFiles) {
    if (!file.startsWith("assets/") || file.includes("..")) failures.push(`Unsafe asset path: ${file} (${asset.id})`);
  }
  try {
    if (asset.defaultColor) resolveReference(asset.defaultColor);
    for (const file of assetFiles) {
      await readFile(resolve(root, file));
    }
    if (asset.format === "image/svg+xml") {
      const source = await readFile(resolve(root, asset.path), "utf8");
      if (!source.includes("<svg")) failures.push(`SVG asset is invalid: ${asset.id}`);
      if (!source.includes(`viewBox="${asset.viewBox}"`)) failures.push(`SVG viewBox does not match manifest: ${asset.id}`);
      if (!source.includes("currentColor")) failures.push(`SVG asset must use currentColor: ${asset.id}`);
      if (!guidelineHtml.includes(asset.path)) failures.push(`Site is missing asset: ${asset.id}`);
    }
  } catch (error) {
    failures.push(`Asset ${asset.id}: ${error.message}`);
  }
}

// 成熟度（status / pending）の整合を検査する。
const sourceStatuses = new Set(["candidate", "selected", "approved"]);
const statusedSources = [
  ["tokens/colors.json", colorSource],
  ["tokens/typography.json", typographySource],
  ["tokens/layout.json", layoutSource],
  ["tokens/shape.json", shapeSource],
  ["tokens/components.json", componentSource],
  ["assets/manifest.json", assetSource],
];
const validatePending = (label, pending) => {
  if (pending === undefined) return;
  if (!Array.isArray(pending)) {
    failures.push(`${label}: pending must be an array`);
    return;
  }
  for (const entry of pending) {
    for (const field of ["topic", "until", "interim"]) {
      if (typeof entry[field] !== "string" || !entry[field].trim()) {
        failures.push(`${label}: pending entry is missing "${field}" (${entry.topic ?? "unnamed"})`);
      }
    }
  }
};
for (const [label, source] of statusedSources) {
  if (!sourceStatuses.has(source.status)) failures.push(`${label}: unknown status "${source.status}"`);
  validatePending(label, source.pending);
}
for (const asset of assetSource.assets) validatePending(`asset ${asset.id}`, asset.pending);

// docs/ の散文には値を再掲しない（横断判断のみ）。生値の再流入を検知する。
const { readdir } = await import("node:fs/promises");
const docsDir = resolve(root, "docs");
for (const entry of await readdir(docsDir, { recursive: true })) {
  if (!entry.endsWith(".md")) continue;
  const body = await readFile(resolve(docsDir, entry), "utf8");
  const lines = body.split("\n");
  lines.forEach((line, index) => {
    if (/#[0-9a-fA-F]{3,8}\b/.test(line)) {
      failures.push(`docs/${entry}:${index + 1}: raw color value in docs (define values in tokens/*.json and reference by token name)`);
    }
    if (/\d+(px|rem|em|vw|vh)\b/.test(line)) {
      failures.push(`docs/${entry}:${index + 1}: raw dimension value in docs (define values in tokens/*.json and reference by token name)`);
    }
  });
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

for (const check of [...colorSource.contrastChecks, ...componentSource.contrastChecks]) {
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
  console.log(`${layoutSource.tokens.length} layout tokens validated`);
  console.log(`${shapeSource.tokens.length} shape tokens validated`);
  console.log(`${componentSource.tokens.length} component tokens validated`);
  console.log(`${assetSource.assets.length} brand assets validated`);
}
