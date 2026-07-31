import { serveStdio } from "@modelcontextprotocol/server/stdio";

import { FileSystemRepositoryLoader } from "./loaders/filesystem.js";
import { createServer } from "./mcp/server.js";

const repositoryRoot = new URL("../../", import.meta.url);
const loader = new FileSystemRepositoryLoader(repositoryRoot);
const handle = serveStdio(() => createServer(loader));

process.on("SIGINT", () => {
  void handle.close();
});

process.on("SIGTERM", () => {
  void handle.close();
});
