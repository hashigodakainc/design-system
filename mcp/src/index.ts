import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";

import {
  type Category,
  loadRepositoryData,
} from "./data.js";

const repository = loadRepositoryData();
const categorySchema = z.enum(["color", "typography", "layout"]);
const jsonObjectSchema = z.record(z.string(), z.json());
const pendingSummarySchema = z.object({
  source: z.string(),
  pending: jsonObjectSchema,
});
const statusSummarySchema = z.object({
  source: z.string(),
  status: z.string().nullable(),
});
const sourceSchema = z.object({
  path: z.string(),
  status: z.string().nullable(),
  pending: z.array(jsonObjectSchema),
});
const tokenSchema = z.object({
  name: z.string(),
  value: z.string(),
  resolved: z.string(),
  description: z.string().nullable(),
  type: z.string().nullable(),
});
const roleSchema = jsonObjectSchema;
const tokenCategorySchema = z.object({
  category: categorySchema,
  source: sourceSchema,
  tokens: z.array(tokenSchema),
  roles: z.array(roleSchema).optional(),
});

function statusesForCategories(categories: Category[]) {
  return categories.map((category) => {
    const data = repository.tokenCategories.get(category);
    if (data === undefined) {
      throw new Error(`Token category not loaded: ${category}`);
    }
    return { source: data.source.path, status: data.source.status };
  });
}

function pendingForCategories(categories: Category[]) {
  return categories.flatMap((category) => {
    const data = repository.tokenCategories.get(category);
    if (data === undefined) {
      throw new Error(`Token category not loaded: ${category}`);
    }
    return data.source.pending.map((pending) => ({
      source: data.source.path,
      pending,
    }));
  });
}

export function createServer(): McpServer {
  const server = new McpServer(
    {
      name: "hashigodaka-design-system",
      version: "0.1.0",
    },
    { instructions: repository.instructions },
  );

  server.registerTool(
    "get_tokens",
    {
      title: "Get design tokens",
      description:
        "Hashigodakaの正本JSONからデザイントークンを取得します。categoryを省略すると全カテゴリを返します。",
      inputSchema: z.object({
        category: categorySchema
          .optional()
          .describe("取得カテゴリ。省略時は color / typography / layout の全件。"),
      }),
      outputSchema: z.object({
        status: z.array(statusSummarySchema),
        pending: z.array(pendingSummarySchema),
        categories: z.array(tokenCategorySchema),
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async ({ category }) => {
      const categories: Category[] =
        category === undefined
          ? ["color", "typography", "layout"]
          : [category];
      const selected = categories.map((name) => {
        const data = repository.tokenCategories.get(name);
        if (data === undefined) {
          throw new Error(`Token category not loaded: ${name}`);
        }
        return data;
      });
      const pending = pendingForCategories(categories);
      const output = {
        status: statusesForCategories(categories),
        pending,
        categories: selected,
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(output),
          },
        ],
        structuredContent: output,
      };
    },
  );

  server.registerTool(
    "get_asset",
    {
      title: "Get brand asset",
      description: `Hashigodakaの資産メタデータを取得します。有効なid: ${repository.assetIds.join(", ")}。SVG資産はソース本文も返します。フォントはメタデータのみです。`,
      inputSchema: z.object({
        id: z
          .enum(repository.assetIds)
          .describe(`資産ID。有効値: ${repository.assetIds.join(", ")}`),
      }),
      outputSchema: z.object({
        id: z.string(),
        source: sourceSchema,
        status: z.array(statusSummarySchema),
        pending: z.array(pendingSummarySchema),
        asset: jsonObjectSchema,
        svgSource: z.string().optional(),
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async ({ id }) => {
      const asset = repository.assets.get(id);
      if (asset === undefined) {
        throw new Error(`Asset not loaded: ${id}`);
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(asset),
          },
        ],
        structuredContent: asset,
      };
    },
  );

  server.registerTool(
    "read_guideline",
    {
      title: "Read design guideline",
      description: `Hashigodakaの横断的なガイドライン本文を取得します。有効なid: ${repository.guidelineIds.join(", ")}。docs/*.mdは再起動時に自動走査されます。`,
      inputSchema: z.object({
        id: z
          .enum(repository.guidelineIds)
          .describe(`ガイドラインID。有効値: ${repository.guidelineIds.join(", ")}`),
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async ({ id }) => {
      const guideline = repository.guidelines.get(id);
      if (guideline === undefined) {
        throw new Error(`Guideline not loaded: ${id}`);
      }

      return {
        content: [
          {
            type: "text",
            text: guideline.markdown,
          },
        ],
      };
    },
  );

  return server;
}

const handle = serveStdio(createServer);

process.on("SIGINT", () => {
  void handle.close();
});

process.on("SIGTERM", () => {
  void handle.close();
});
