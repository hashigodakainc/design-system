import { readFileSync, readdirSync } from "node:fs";

import {
  loadRepositoryData,
  type RepositoryData,
  type RepositoryDataOptions,
  type RepositorySource,
} from "../data.js";
import type { RepositoryDataLoader } from "./types.js";

class FileSystemSource implements RepositorySource {
  public constructor(private readonly repositoryRoot: URL) {}

  public listFiles(directory: string, extension: string): string[] {
    return readdirSync(new URL(`${directory}/`, this.repositoryRoot), {
      withFileTypes: true,
    })
      .filter((entry) => entry.isFile() && entry.name.endsWith(extension))
      .map((entry) => entry.name)
      .sort();
  }

  public readText(path: string): string {
    return readFileSync(new URL(path, this.repositoryRoot), "utf8");
  }
}

export class FileSystemRepositoryLoader implements RepositoryDataLoader {
  private data: RepositoryData | undefined;

  public constructor(
    repositoryRoot: URL,
    private readonly options: RepositoryDataOptions = {},
  ) {
    this.source = new FileSystemSource(repositoryRoot);
  }

  private readonly source: FileSystemSource;

  public load(): RepositoryData {
    this.data ??= loadRepositoryData(this.source, this.options);
    return this.data;
  }
}
