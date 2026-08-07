import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const rootIndex = process.argv.indexOf("--root");
const root = rootIndex === -1 ? scriptRoot : resolve(process.argv[rootIndex + 1]);
const printSnapshot = process.argv.includes("--print");
const sourceNames = ["colors", "typography", "layout", "shape", "components"];
const sources = await Promise.all(
  sourceNames.map(async (name) => JSON.parse(await readFile(resolve(root, `tokens/${name}.json`), "utf8"))),
);
const tokens = new Map(sources.flatMap((source) => source.tokens).map((token) => [token.name, token]));
const typography = sources[1];

const resolveToken = (name, trail = []) => {
  if (trail.includes(name)) throw new Error(`Circular token reference: ${[...trail, name].join(" -> ")}`);
  const token = tokens.get(name);
  if (!token) throw new Error(`Unknown token: ${name}`);
  const reference = /^\{(.+)\}$/.exec(token.value);
  return reference ? resolveToken(reference[1], [...trail, name]) : token.value;
};
const resolveReference = (value) => {
  const reference = /^\{(.+)\}$/.exec(value);
  if (!reference) throw new Error(`Expected token reference: ${value}`);
  return resolveToken(reference[1]);
};
const cssVariableToToken = new Map(
  [...tokens.keys()].map((name) => [`--hsg-${name.replaceAll(".", "-")}`, name]),
);
const normalizeCss = (source) => source
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/var\(\s*(--hsg-[a-z0-9-]+)\s*\)/g, (_match, variable) => {
    const tokenName = cssVariableToToken.get(variable);
    if (!tokenName) throw new Error(`Unknown CSS variable in compatibility snapshot: ${variable}`);
    return resolveToken(tokenName);
  })
  .replace(/\s+/g, " ")
  .replace(/\s*([{}:;,])\s*/g, "$1")
  .trim();
const digest = (value) => createHash("sha256").update(value).digest("hex");
const resolvedRoles = Object.fromEntries(typography.roles.map((role) => [
  role.name,
  {
    family: resolveToken(`typography.family.${role.family}`),
    fontSize: resolveReference(role.fontSize),
    ...(role.mobileFontSize ? { mobileFontSize: resolveReference(role.mobileFontSize) } : {}),
    fontWeight: resolveReference(role.fontWeight),
    lineHeight: resolveReference(role.lineHeight),
    letterSpacing: resolveReference(role.letterSpacing),
  },
]));
const componentCss = normalizeCss(await readFile(resolve(root, "styles/components.css"), "utf8"));
const typographyCss = normalizeCss(await readFile(resolve(root, "styles/typography.css"), "utf8"));
const snapshot = {
  resolvedRoles,
  componentCss: {
    blockCount: (componentCss.match(/\{/g) ?? []).length,
    sha256: digest(componentCss),
  },
  typographyCss: {
    blockCount: (typographyCss.match(/\{/g) ?? []).length,
    sha256: digest(typographyCss),
  },
};

if (printSnapshot) {
  process.stdout.write(`${JSON.stringify(snapshot, null, 2)}\n`);
} else {
  const baseline = JSON.parse(await readFile(resolve(scriptRoot, "scripts/visual-compatibility-baseline.json"), "utf8"));
  if (JSON.stringify(snapshot) !== JSON.stringify(baseline)) {
    console.error("Resolved typography roles or component styles changed from the approved visual baseline.");
    console.error(JSON.stringify({ baseline, actual: snapshot }, null, 2));
    process.exitCode = 1;
  } else {
    console.log(`Visual compatibility snapshot matched ${Object.keys(resolvedRoles).length} typography roles and ${snapshot.componentCss.blockCount} component CSS blocks.`);
  }
}
