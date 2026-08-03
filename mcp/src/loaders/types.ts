import type { RepositoryData } from "../data.js";

export interface RepositoryDataLoader {
  load(): RepositoryData;
}
