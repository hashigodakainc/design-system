import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import type {
  DesignSystemSnapshot,
  SnapshotStaticAsset,
} from "../src/snapshot.js";

const REQUIRED_TEXT_FILES = [
  "tokens/colors.json",
  "tokens/typography.json",
  "tokens/layout.json",
  "assets/manifest.json",
] as const;

const STATIC_CONTENT_TYPES: Record<string, string> = {
  ".otf": "font/otf",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

export async function buildSnapshot(
  repositoryArgument: string,
  outputArgument: string,
): Promise<{
  outputPath: string;
  staticAssetCount: number;
  textFileCount: number;
}> {
  const repositoryRoot = resolve(repositoryArgument);
  const outputPath = resolve(outputArgument);
  const textPaths = [
    ...REQUIRED_TEXT_FILES,
    ...(await collectFiles(join(repositoryRoot, "docs"), ".md")).map((path) =>
      repositoryPath(repositoryRoot, path),
    ),
    ...(await collectFiles(join(repositoryRoot, "styles"), ".css")).map((path) =>
      repositoryPath(repositoryRoot, path),
    ),
    ...(await collectFiles(join(repositoryRoot, "assets"), ".svg")).map((path) =>
      repositoryPath(repositoryRoot, path),
    ),
  ].sort();
  const uniqueTextPaths = [...new Set(textPaths)];
  const textFiles = Object.fromEntries(
    await Promise.all(
      uniqueTextPaths.map(async (path) => [
        path,
        await readFile(join(repositoryRoot, path), "utf8"),
      ]),
    ),
  );

  const staticAssets = await collectStaticAssets(repositoryRoot);
  validateManifestAssets(textFiles["assets/manifest.json"], staticAssets);

  const snapshot: DesignSystemSnapshot = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    textFiles,
    staticAssets,
  };

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(snapshot)}\n`, "utf8");

  return {
    outputPath,
    staticAssetCount: staticAssets.length,
    textFileCount: uniqueTextPaths.length,
  };
}

async function collectFiles(
  directory: string,
  extension: string,
): Promise<string[]> {
  const paths: string[] = [];
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      paths.push(...(await collectFiles(path, extension)));
    } else if (entry.isFile() && extname(entry.name) === extension) {
      paths.push(path);
    }
  }
  return paths.sort();
}

async function collectStaticAssets(
  repositoryRoot: string,
): Promise<SnapshotStaticAsset[]> {
  const assetRoot = join(repositoryRoot, "assets");
  const files = await collectAllFiles(assetRoot);
  const assets = await Promise.all(
    files.flatMap((path) => {
      const contentType = STATIC_CONTENT_TYPES[extname(path).toLowerCase()];
      if (contentType === undefined) {
        return [];
      }
      return [
        stat(path).then((metadata) => ({
          contentType,
          path: repositoryPath(repositoryRoot, path),
          size: metadata.size,
        })),
      ];
    }),
  );
  return assets.sort((left, right) => left.path.localeCompare(right.path));
}

async function collectAllFiles(directory: string): Promise<string[]> {
  const paths: string[] = [];
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      paths.push(...(await collectAllFiles(path)));
    } else if (entry.isFile()) {
      paths.push(path);
    }
  }
  return paths;
}

function repositoryPath(repositoryRoot: string, path: string): string {
  return relative(repositoryRoot, path).split(sep).join("/");
}

function validateManifestAssets(
  manifestSource: string | undefined,
  staticAssets: SnapshotStaticAsset[],
): void {
  if (manifestSource === undefined) {
    throw new Error("Snapshot is missing assets/manifest.json.");
  }
  const manifest: unknown = JSON.parse(manifestSource);
  if (!isRecord(manifest) || !Array.isArray(manifest.assets)) {
    throw new Error("assets/manifest.json must define an assets array.");
  }

  const availablePaths = new Set(staticAssets.map((asset) => asset.path));
  for (const entry of manifest.assets) {
    if (!isRecord(entry) || typeof entry.id !== "string") {
      throw new Error("Every manifest asset must have a string id.");
    }
    const paths = [
      typeof entry.path === "string" ? entry.path : undefined,
      ...(Array.isArray(entry.variants)
        ? entry.variants.filter(
            (value): value is string => typeof value === "string",
          )
        : []),
    ].filter((value): value is string => value !== undefined);
    for (const path of paths) {
      if (!availablePaths.has(path)) {
        throw new Error(
          `Manifest asset ${entry.id} references a missing static asset: ${path}`,
        );
      }
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function main(argv: string[]): Promise<void> {
  const repositoryDefault = fileURLToPath(new URL("../../", import.meta.url));
  const outputDefault = fileURLToPath(
    new URL("../src/generated/design-snapshot.json", import.meta.url),
  );
  const [repositoryArgument = repositoryDefault, outputArgument = outputDefault] =
    argv;
  const result = await buildSnapshot(repositoryArgument, outputArgument);
  process.stdout.write(
    `Wrote ${result.textFileCount} text files and ${result.staticAssetCount} static assets to ${result.outputPath}\n`,
  );
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main(process.argv.slice(2)).catch((error: unknown) => {
    process.stderr.write(
      `${error instanceof Error ? error.stack ?? error.message : String(error)}\n`,
    );
    process.exitCode = 1;
  });
}
