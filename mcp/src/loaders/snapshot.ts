import {
  loadRepositoryData,
  type RepositoryData,
  type RepositoryDataOptions,
  type RepositorySource,
} from "../data.js";
import type { DesignSystemSnapshot } from "../snapshot.js";
import type { RepositoryDataLoader } from "./types.js";

class SnapshotSource implements RepositorySource {
  public constructor(private readonly snapshot: DesignSystemSnapshot) {}

  public listFiles(directory: string, extension: string): string[] {
    const prefix = `${directory}/`;
    return Object.keys(this.snapshot.textFiles)
      .filter((path) => {
        if (!path.startsWith(prefix) || !path.endsWith(extension)) {
          return false;
        }
        return !path.slice(prefix.length).includes("/");
      })
      .map((path) => path.slice(prefix.length))
      .sort();
  }

  public readText(path: string): string {
    const value = this.snapshot.textFiles[path];
    if (value === undefined) {
      throw new Error(`Snapshot does not contain ${path}.`);
    }
    return value;
  }
}

export class SnapshotRepositoryLoader implements RepositoryDataLoader {
  private data: RepositoryData | undefined;

  public constructor(
    snapshot: DesignSystemSnapshot,
    private readonly options: RepositoryDataOptions = {},
  ) {
    if (snapshot.schemaVersion !== 1) {
      throw new Error(
        `Unsupported design system snapshot schema: ${snapshot.schemaVersion}`,
      );
    }
    this.source = new SnapshotSource(snapshot);
  }

  private readonly source: SnapshotSource;

  public load(): RepositoryData {
    this.data ??= loadRepositoryData(this.source, this.options);
    return this.data;
  }
}
