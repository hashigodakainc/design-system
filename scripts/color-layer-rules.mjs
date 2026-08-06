const referencePattern = /^\{(.+)\}$/;
const legacyColorNames = new Set([
  "color.neutral.canvas",
  "color.neutral.surface",
  "color.neutral.border",
  "color.neutral.muted",
  "color.neutral.ink",
  "color.background.surface",
  "color.border.subtle",
]);
const componentRoots = new Set(["button", "badge", "menu", "card"]);
const typographyRoleNames = new Set([
  "display",
  "heading-1",
  "heading-2",
  "heading-3",
  "heading-4",
  "body-large",
  "body",
  "body-small",
  "label",
  "label-large",
  "caption",
  "code",
]);
const layoutNamePatterns = [
  /^space\.(?:0|[1-9]|10)$/,
  /^layout\.(?:page|content|section|grid|breakpoint|sidebar|mobile-header)\./,
  /^radius\.(?:small|medium)$/,
  /^border\.width\.(?:default|strong)$/,
  /^focus\.outline\.(?:width|offset)$/,
];

export function validateTokenLayers({ colorSource, componentSource, typographySource, layoutSource }) {
  const errors = [];
  const warnings = [];
  const sources = [colorSource, componentSource, typographySource, layoutSource];
  const tokens = new Map(sources.flatMap((source) => source.tokens).map((token) => [token.name, token]));
  const exceptions = new Set(componentSource.primitiveReferenceExceptions ?? []);
  const usedExceptions = new Set();

  for (const token of colorSource.tokens) {
    if (legacyColorNames.has(token.name)) errors.push(`Legacy color token must not be reintroduced: ${token.name}`);
    if (!token.name.startsWith("color.")) errors.push(`tokens/colors.json may only contain color.* tokens: ${token.name}`);
    if (token.type !== "color") errors.push(`tokens/colors.json token must have color type: ${token.name}`);
    if (!new Set(["primitive", "semantic"]).has(token.layer)) {
      errors.push(`tokens/colors.json token has a forbidden layer: ${token.name} (${token.layer ?? "missing"})`);
      continue;
    }

    const reference = referencePattern.exec(token.value)?.[1];
    if (token.layer === "primitive") {
      if (reference) errors.push(`Primitive token must not reference another token: ${token.name}`);
      else if (!/^#[0-9a-f]{6}$/i.test(token.value)) errors.push(`Primitive color token must contain a six-digit hex value: ${token.name}`);
      continue;
    }
    if (!reference) {
      errors.push(`Semantic color token must reference another color token: ${token.name}`);
      continue;
    }
    const target = tokens.get(reference);
    if (!target) errors.push(`Semantic color token references an unknown token: ${token.name} -> ${reference}`);
    else if (target.type !== "color" || !new Set(["primitive", "semantic"]).has(target.layer)) {
      errors.push(`Semantic color token must reference primitive or semantic color: ${token.name} -> ${reference}`);
    }
  }

  for (const exception of exceptions) {
    const token = tokens.get(exception);
    if (!token) errors.push(`Unknown primitive reference exception: ${exception}`);
    else if (!componentSource.tokens.includes(token) || token.layer !== "component" || token.type !== "color") {
      errors.push(`Primitive reference exception must name a component color token: ${exception}`);
    }
  }

  for (const token of componentSource.tokens) {
    const root = token.name.split(".")[0];
    if (!componentRoots.has(root)) errors.push(`tokens/components.json has an unknown component root: ${token.name}`);
    if (token.layer !== "component") errors.push(`tokens/components.json token must use component layer: ${token.name}`);
    if (!new Set(["color", "dimension"]).has(token.type)) {
      errors.push(`tokens/components.json token has an unsupported type: ${token.name} (${token.type})`);
    }

    const reference = referencePattern.exec(token.value)?.[1];
    if (!reference) {
      errors.push(`Component token must reference a non-component token: ${token.name}`);
      continue;
    }
    const target = tokens.get(reference);
    if (!target) {
      errors.push(`Component token references an unknown token: ${token.name} -> ${reference}`);
      continue;
    }
    if (target.layer === "component") {
      errors.push(`Component token must not reference the same layer: ${token.name} -> ${reference}`);
      continue;
    }
    if (target.type !== token.type) errors.push(`Component token type does not match its reference: ${token.name} -> ${reference}`);
    if (target.layer === "primitive") {
      if (!exceptions.has(token.name)) {
        errors.push(`Component token references a primitive without an exception: ${token.name} -> ${reference}`);
      } else {
        usedExceptions.add(token.name);
        if (typeof token.$comment !== "string" || !token.$comment.trim()) {
          errors.push(`Primitive reference exception must include a reason comment: ${token.name}`);
        }
        warnings.push(`Allowed component-to-primitive reference: ${token.name} -> ${reference}`);
      }
    }
  }
  for (const exception of exceptions) {
    if (tokens.has(exception) && !usedExceptions.has(exception)) errors.push(`Primitive reference exception is not used: ${exception}`);
  }

  for (const token of layoutSource.tokens) {
    if ("layer" in token) errors.push(`tokens/layout.json must not declare color layers: ${token.name}`);
    if (!layoutNamePatterns.some((pattern) => pattern.test(token.name))) {
      errors.push(`tokens/layout.json has an unsupported token structure: ${token.name}`);
    }
  }

  const roleNames = new Set(typographySource.roles.map((role) => role.name));
  for (const role of roleNames) {
    if (!typographyRoleNames.has(role)) errors.push(`tokens/typography.json has an unsupported role: ${role}`);
  }
  for (const token of typographySource.tokens) {
    if ("layer" in token) errors.push(`tokens/typography.json must not declare color layers: ${token.name}`);
    if (!token.name.startsWith("typography.")) errors.push(`tokens/typography.json may only contain typography.* tokens: ${token.name}`);
    if (token.name.startsWith("typography.size.") && !typographySource.roles.some((role) => {
      const references = [role.fontSize, role.mobileFontSize].filter(Boolean);
      return references.includes(`{${token.name}}`);
    })) {
      errors.push(`Typography size token must be used by a supported role: ${token.name}`);
    }
  }

  return { errors, warnings };
}
