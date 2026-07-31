import type { Icon } from "@modelcontextprotocol/server";

import type { RepositoryData } from "../data.js";

export function createServerIcons(repository: RepositoryData): Icon[] {
  const svgSource = repository.assets.get("motif.brand")?.svgSource;
  if (!svgSource) {
    throw new Error(
      'Server icon requires the "motif.brand" asset with SVG source.',
    );
  }

  const bytes = new TextEncoder().encode(svgSource);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return [
    {
      src: `data:image/svg+xml;base64,${btoa(binary)}`,
      mimeType: "image/svg+xml",
      sizes: ["any"],
    },
  ];
}
