export type JsonPrimitive = boolean | null | number | string;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export type JsonObject = { [key: string]: JsonValue };

export type Category = "color" | "component" | "layout" | "shape" | "typography";

export interface PendingSummary {
  pending: JsonObject;
  source: string;
}

export interface SourceMetadata {
  path: string;
  pending: JsonObject[];
  status: string | null;
}

export interface StatusSummary {
  source: string;
  status: string | null;
}

export interface ResolvedToken {
  description: string | null;
  layer: string | null;
  name: string;
  resolved: string;
  type: string | null;
  value: string;
}

export interface TokenCategoryData {
  category: Category;
  roles?: JsonObject[];
  source: SourceMetadata;
  tokens: ResolvedToken[];
}

export interface AssetData {
  asset: JsonObject;
  id: string;
  pending: PendingSummary[];
  source: SourceMetadata;
  status: StatusSummary[];
  svgSource?: string;
}

export interface GuidelineData {
  id: string;
  markdown: string;
  pending: PendingSummary[];
  source: SourceMetadata;
  status: StatusSummary[];
}

export interface RepositoryData {
  assetIds: [string, ...string[]];
  assets: Map<string, AssetData>;
  guidelineIds: [string, ...string[]];
  guidelines: Map<string, GuidelineData>;
  instructions: string;
  stylesheetNames: [string, ...string[]];
  stylesheets: Map<string, string>;
  tokenCategories: Map<Category, TokenCategoryData>;
}

export interface RepositorySource {
  listFiles(directory: string, extension: string): string[];
  readText(path: string): string;
}

export interface RepositoryDataOptions {
  assetBaseUrl?: string;
}

const categoryPaths: Record<Category, string> = {
  color: "tokens/colors.json",
  component: "tokens/components.json",
  typography: "tokens/typography.json",
  layout: "tokens/layout.json",
  shape: "tokens/shape.json",
};

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readJson(source: RepositorySource, relativePath: string): JsonObject {
  const contents = source.readText(relativePath);
  const value: unknown = JSON.parse(contents);

  if (!isJsonObject(value)) {
    throw new Error(`${relativePath} must contain a JSON object.`);
  }

  return value;
}

function stringField(object: JsonObject, field: string, source: string): string {
  const value = object[field];
  if (typeof value !== "string") {
    throw new Error(`${source}.${field} must be a string.`);
  }
  return value;
}

function objectArrayField(object: JsonObject, field: string, source: string): JsonObject[] {
  const value = object[field];
  if (!Array.isArray(value) || !value.every(isJsonObject)) {
    throw new Error(`${source}.${field} must be an array of objects.`);
  }
  return value;
}

function pendingFrom(object: JsonObject): JsonObject[] {
  const pending = object.pending;
  return Array.isArray(pending) && pending.every(isJsonObject) ? pending : [];
}

function statusFrom(object: JsonObject): string | null {
  return typeof object.status === "string" ? object.status : null;
}

function sourceMetadata(path: string, object: JsonObject): SourceMetadata {
  return {
    path,
    status: statusFrom(object),
    pending: pendingFrom(object),
  };
}

function resolveJsonAliases(
  value: JsonValue,
  resolveAlias: (name: string) => string,
): JsonValue {
  if (typeof value === "string") {
    return value.replace(/\{([^{}]+)\}/g, (_match, name: string) =>
      resolveAlias(name.trim()),
    );
  }
  if (Array.isArray(value)) {
    return value.map((item) => resolveJsonAliases(item, resolveAlias));
  }
  if (isJsonObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        resolveJsonAliases(item, resolveAlias),
      ]),
    );
  }
  return value;
}

function collectPending(
  value: JsonValue,
  source: string,
  context = "",
): PendingSummary[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      collectPending(item, source, `${context}[${index}]`),
    );
  }
  if (!isJsonObject(value)) {
    return [];
  }

  const summaries: PendingSummary[] = [];
  const pending = pendingFrom(value);
  const pendingSource = context ? `${source}${context}` : source;
  summaries.push(
    ...pending.map((item) => ({ source: pendingSource, pending: item })),
  );

  for (const [key, item] of Object.entries(value)) {
    if (key !== "pending") {
      summaries.push(...collectPending(item, source, `${context}.${key}`));
    }
  }
  return summaries;
}

function pendingLabel(summary: PendingSummary): string {
  const topic = summary.pending.topic;
  const until = summary.pending.until;
  const interim = summary.pending.interim;
  const parts = [
    typeof topic === "string" ? topic : JSON.stringify(summary.pending),
    typeof until === "string" ? `条件: ${until}` : null,
    typeof interim === "string" ? `暫定: ${interim}` : null,
  ].filter((part): part is string => part !== null);
  return `${summary.source}: ${parts.join(" / ")}`;
}

function absoluteAssetUrl(baseUrl: string, path: string): string {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(path, normalizedBase).href;
}

function withAssetUrls(
  entry: JsonObject,
  baseUrl: string,
  assetPath: string,
): JsonObject {
  const variants = entry.variants;
  const variantUrls =
    Array.isArray(variants) && variants.every((value) => typeof value === "string")
      ? variants.map((path) => absoluteAssetUrl(baseUrl, path))
      : [];

  return {
    ...entry,
    url: absoluteAssetUrl(baseUrl, assetPath),
    ...(variantUrls.length > 0 ? { variantUrls } : {}),
  };
}

function loadTokenCategories(source: RepositorySource): {
  categories: Map<Category, TokenCategoryData>;
  jsonFiles: Map<string, JsonObject>;
} {
  const jsonFiles = new Map<string, JsonObject>();
  const rawCategories = new Map<
    Category,
    { file: JsonObject; path: string; roles: JsonObject[]; tokens: JsonObject[] }
  >();
  const tokenValues = new Map<string, string>();

  for (const category of Object.keys(categoryPaths) as Category[]) {
    const path = categoryPaths[category];
    const file = readJson(source, path);
    const tokens = objectArrayField(file, "tokens", path);
    const roles =
      category === "typography" ? objectArrayField(file, "roles", path) : [];

    jsonFiles.set(path, file);
    rawCategories.set(category, { file, path, roles, tokens });

    for (const token of tokens) {
      const name = stringField(token, "name", path);
      const value = stringField(token, "value", `${path}:${name}`);
      if (tokenValues.has(name)) {
        throw new Error(`Duplicate token name: ${name}`);
      }
      tokenValues.set(name, value);
    }
  }

  const resolvedCache = new Map<string, string>();
  const resolveAlias = (name: string, trail: string[] = []): string => {
    const cached = resolvedCache.get(name);
    if (cached !== undefined) {
      return cached;
    }
    if (trail.includes(name)) {
      throw new Error(`Token alias cycle: ${[...trail, name].join(" -> ")}`);
    }

    const value = tokenValues.get(name);
    if (value === undefined) {
      throw new Error(`Unknown token alias: ${name}`);
    }

    const resolved = value.replace(
      /\{([^{}]+)\}/g,
      (_match, referencedName: string) =>
        resolveAlias(referencedName.trim(), [...trail, name]),
    );
    resolvedCache.set(name, resolved);
    return resolved;
  };

  const categories = new Map<Category, TokenCategoryData>();
  for (const [category, raw] of rawCategories) {
    const tokens = raw.tokens.map((token) => {
      const name = stringField(token, "name", raw.path);
      return {
        name,
        value: stringField(token, "value", `${raw.path}:${name}`),
        resolved: resolveAlias(name),
        description:
          typeof token.description === "string" ? token.description : null,
        layer: typeof token.layer === "string" ? token.layer : null,
        type: typeof token.type === "string" ? token.type : null,
      };
    });

    const data: TokenCategoryData = {
      category,
      source: sourceMetadata(raw.path, raw.file),
      tokens,
    };

    if (category === "typography") {
      data.roles = raw.roles.map((role, index) => {
        const source = `${raw.path}:roles[${index}]`;
        const family = stringField(role, "family", source);
        const familyToken = `typography.family.${family}`;
        if (!tokenValues.has(familyToken)) {
          throw new Error(`Unknown typography family: ${family}`);
        }

        const resolved = resolveJsonAliases(role, (name) => resolveAlias(name));
        if (!isJsonObject(resolved)) {
          throw new Error(`${source} must resolve to an object.`);
        }

        return {
          ...role,
          resolved: {
            ...resolved,
            family: resolveAlias(familyToken),
          },
        };
      });
    }
    categories.set(category, data);
  }

  return { categories, jsonFiles };
}

function loadAssets(
  source: RepositorySource,
  options: RepositoryDataOptions,
): {
  assetIds: [string, ...string[]];
  assets: Map<string, AssetData>;
  manifest: JsonObject;
} {
  const manifestPath = "assets/manifest.json";
  const manifest = readJson(source, manifestPath);
  const entries = objectArrayField(manifest, "assets", manifestPath);
  const manifestSource = sourceMetadata(manifestPath, manifest);
  const assets = new Map<string, AssetData>();

  for (const entry of entries) {
    const id = stringField(entry, "id", manifestPath);
    const status = statusFrom(entry);
    const entryPending = pendingFrom(entry);
    const pending: PendingSummary[] = [
      ...manifestSource.pending.map((item) => ({
        source: manifestPath,
        pending: item,
      })),
      ...entryPending.map((item) => ({
        source: `${manifestPath}:${id}`,
        pending: item,
      })),
    ];
    const assetPath = stringField(entry, "path", `${manifestPath}:${id}`);
    const asset =
      options.assetBaseUrl === undefined
        ? entry
        : withAssetUrls(entry, options.assetBaseUrl, assetPath);
    const data: AssetData = {
      id,
      asset,
      source: manifestSource,
      status: [
        { source: manifestPath, status: manifestSource.status },
        { source: `${manifestPath}:${id}`, status },
      ],
      pending,
    };

    if (entry.format === "image/svg+xml") {
      data.svgSource = source.readText(assetPath);
    }
    assets.set(id, data);
  }

  const assetIds = [...assets.keys()].sort();
  if (assetIds.length === 0) {
    throw new Error(`${manifestPath} must define at least one asset.`);
  }

  return {
    assetIds: assetIds as [string, ...string[]],
    assets,
    manifest,
  };
}

function loadGuidelines(sourceLoader: RepositorySource): {
  guidelineIds: [string, ...string[]];
  guidelines: Map<string, GuidelineData>;
} {
  const markdownFiles = sourceLoader.listFiles("docs", ".md");
  const guidelines = new Map<string, GuidelineData>();

  for (const filename of markdownFiles) {
    const id = filename.slice(0, -".md".length);
    const path = `docs/${filename}`;
    const source: SourceMetadata = { path, status: null, pending: [] };
    guidelines.set(id, {
      id,
      markdown: sourceLoader.readText(path),
      source,
      status: [{ source: path, status: null }],
      pending: [],
    });
  }

  const guidelineIds = [...guidelines.keys()];
  if (guidelineIds.length === 0) {
    throw new Error("docs/ must contain at least one Markdown guideline.");
  }

  return {
    guidelineIds: guidelineIds as [string, ...string[]],
    guidelines,
  };
}

function loadStylesheets(source: RepositorySource): {
  stylesheetNames: [string, ...string[]];
  stylesheets: Map<string, string>;
} {
  const cssFiles = source.listFiles("styles", ".css");
  const stylesheets = new Map<string, string>();

  for (const filename of cssFiles) {
    const name = filename.slice(0, -".css".length);
    const path = `styles/${filename}`;
    stylesheets.set(name, source.readText(path));
  }

  const stylesheetNames = [...stylesheets.keys()];
  if (stylesheetNames.length === 0) {
    throw new Error("styles/ must contain at least one CSS stylesheet.");
  }

  return {
    stylesheetNames: stylesheetNames as [string, ...string[]],
    stylesheets,
  };
}

function buildInstructions(
  jsonFiles: Map<string, JsonObject>,
  manifest: JsonObject,
): string {
  const sources = new Map(jsonFiles);
  sources.set("assets/manifest.json", manifest);

  const statuses = [...sources].map(
    ([source, value]) => `${source}=${statusFrom(value) ?? "未定義"}`,
  );
  const pending = [...sources].flatMap(([source, value]) =>
    collectPending(value, source),
  );
  const pendingText =
    pending.length === 0
      ? "未決事項はありません。"
      : `未決事項（${pending.length}件）: ${pending.map(pendingLabel).join(" | ")}`;

  return [
    "HashigodakaのWeb UI、サイト、スライド、提案書、図解、SNS画像、ロゴ、配色、書体、余白、コンポーネントについて作成・修正・レビューするときに使う。",
    "Hashigodakaデザインシステムの正本を提供する参照専用MCPサーバーです。",
    "制作前に read_guideline の id=\"guidelines\" を読んでください。値は get_tokens からトークン名で参照し、資産は get_asset で利用条件とともに取得してください。",
    "採用済みコンポーネント（メニュー・ボタン・カード・バッジ）を使う場合は get_tokens の category=\"component\" と get_stylesheet の name=\"components\" を取得して実装をコピーし、再発明しないでください。CSS変数を使う実装では name=\"tokens\" / \"typography\" も取得できます。",
    `正本の状態: ${statuses.join(", ")}。`,
    pendingText,
  ].join("\n");
}

export function loadRepositoryData(
  source: RepositorySource,
  options: RepositoryDataOptions = {},
): RepositoryData {
  const { categories, jsonFiles } = loadTokenCategories(source);
  const { assetIds, assets, manifest } = loadAssets(source, options);
  const { guidelineIds, guidelines } = loadGuidelines(source);
  const { stylesheetNames, stylesheets } = loadStylesheets(source);

  return {
    assetIds,
    assets,
    guidelineIds,
    guidelines,
    instructions: buildInstructions(jsonFiles, manifest),
    stylesheetNames,
    stylesheets,
    tokenCategories: categories,
  };
}

export function summarizePending(pending: PendingSummary[]): string {
  return pending.length === 0
    ? "なし"
    : pending.map(pendingLabel).join(" | ");
}
