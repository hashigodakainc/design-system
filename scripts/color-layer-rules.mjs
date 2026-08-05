const referencePattern = /^\{(.+)\}$/;
const layers = new Set(["primitive", "semantic", "component"]);
const legacyNames = new Set([
  "color.neutral.canvas",
  "color.neutral.surface",
  "color.neutral.border",
  "color.neutral.muted",
  "color.neutral.ink",
  "color.background.surface",
  "color.border.subtle",
]);

export function validateColorLayers(colorSource) {
  const errors = [];
  const warnings = [];
  const tokens = new Map(colorSource.tokens.map((token) => [token.name, token]));
  const exceptions = new Set(colorSource.primitiveReferenceExceptions ?? []);
  const usedExceptions = new Set();

  for (const exception of exceptions) {
    const token = tokens.get(exception);
    if (!token) errors.push(`Unknown primitive reference exception: ${exception}`);
    else if (token.layer !== "component") errors.push(`Primitive reference exception must be a component token: ${exception}`);
  }

  for (const token of colorSource.tokens) {
    if (legacyNames.has(token.name)) errors.push(`Legacy color token must not be reintroduced: ${token.name}`);
    if (!layers.has(token.layer)) {
      errors.push(`Color token ${token.name} has an unknown layer: ${token.layer ?? "missing"}`);
      continue;
    }

    const reference = referencePattern.exec(token.value)?.[1];
    if (token.layer === "primitive") {
      if (reference) errors.push(`Primitive token must not reference another token: ${token.name}`);
      else if (!/^#[0-9a-f]{6}$/i.test(token.value)) errors.push(`Primitive color token must contain a six-digit hex value: ${token.name}`);
      continue;
    }
    if (!reference) {
      errors.push(`${token.layer} color token must reference another token: ${token.name}`);
      continue;
    }

    const target = tokens.get(reference);
    if (!target) {
      errors.push(`Color token references an unknown color token: ${token.name} -> ${reference}`);
      continue;
    }
    if (token.layer === "semantic" && target.layer !== "primitive") {
      errors.push(`Semantic token must reference a primitive token: ${token.name} -> ${reference}`);
    }
    if (token.layer === "component" && target.layer === "component") {
      errors.push(`Component token must not reference the same layer: ${token.name} -> ${reference}`);
    }
    if (token.layer === "component" && target.layer === "primitive") {
      if (!exceptions.has(token.name)) {
        errors.push(`Component token references a primitive without an exception: ${token.name} -> ${reference}`);
      } else {
        usedExceptions.add(token.name);
        warnings.push(`Allowed component-to-primitive reference: ${token.name} -> ${reference}`);
      }
    }
  }

  for (const exception of exceptions) {
    if (tokens.has(exception) && !usedExceptions.has(exception)) {
      errors.push(`Primitive reference exception is not used: ${exception}`);
    }
  }

  return { errors, warnings };
}
