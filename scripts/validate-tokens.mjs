import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = JSON.parse(await readFile(resolve(root, "tokens/colors.json"), "utf8"));
const generatedCss = await readFile(resolve(root, "styles/tokens.css"), "utf8");
const exampleHtml = await readFile(resolve(root, "examples/color-foundations.html"), "utf8");
const tokens = new Map();
const failures = [];

for (const token of source.tokens) {
  if (tokens.has(token.name)) failures.push(`Duplicate token: ${token.name}`);
  if (token.type !== "color") failures.push(`Unsupported type for ${token.name}: ${token.type}`);
  tokens.set(token.name, token);
}

const cssName = (name) => `--hsg-${name.replaceAll(".", "-")}`;
const cssValue = (value) => {
  const match = /^\{(.+)\}$/.exec(value);
  return match ? `var(${cssName(match[1])})` : value;
};

for (const token of source.tokens) {
  const declaration = `${cssName(token.name)}: ${cssValue(token.value)};`;
  if (!generatedCss.includes(declaration)) failures.push(`Generated CSS is stale or missing: ${token.name}`);
}

for (const match of exampleHtml.matchAll(/var\((--hsg-[a-z0-9-]+)\)/g)) {
  if (!generatedCss.includes(`${match[1]}:`)) failures.push(`Example uses an unknown CSS variable: ${match[1]}`);
}

const resolveValue = (name, trail = []) => {
  if (trail.includes(name)) throw new Error(`Circular reference: ${[...trail, name].join(" -> ")}`);
  const token = tokens.get(name);
  if (!token) throw new Error(`Unknown token: ${name}`);
  const reference = /^\{(.+)\}$/.exec(token.value);
  return reference ? resolveValue(reference[1], [...trail, name]) : token.value;
};

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

for (const token of source.tokens) {
  try {
    resolveValue(token.name);
  } catch (error) {
    failures.push(error.message);
  }
}

for (const check of source.contrastChecks) {
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
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`${tokens.size} tokens validated`);
}
