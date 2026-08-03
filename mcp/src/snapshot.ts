export interface SnapshotStaticAsset {
  contentType: string;
  path: string;
  size: number;
}

export interface DesignSystemSnapshot {
  generatedAt: string;
  schemaVersion: 1;
  staticAssets: SnapshotStaticAsset[];
  textFiles: Record<string, string>;
}
