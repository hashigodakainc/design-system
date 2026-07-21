import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = resolve(root, "tokens/colors.json");
const outputPath = resolve(root, "styles/tokens.css");
const source = JSON.parse(await readFile(sourcePath, "utf8"));

const cssName = (name) => `--hsg-${name.replaceAll(".", "-")}`;
const cssValue = (value) => {
  const match = /^\{(.+)\}$/.exec(value);
  return match ? `var(${cssName(match[1])})` : value;
};

const lines = [
  "/* Generated from tokens/colors.json. Do not edit directly. */",
  ":root {",
  ...source.tokens.map((token) => `  ${cssName(token.name)}: ${cssValue(token.value)};`),
  "}",
  "",
];

await writeFile(outputPath, lines.join("\n"), "utf8");
console.log(`Generated ${outputPath}`);
