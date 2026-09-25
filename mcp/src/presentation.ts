import * as z from "zod/v4";
import type { RepositoryData } from "./data.js";

const positive = z.number().positive().finite();
const pending = z.object({
  topic: z.string().min(1),
  until: z.string().min(1),
  interim: z.string().min(1),
});
const colors = z.object(
  Object.fromEntries(
    [
      "canvas",
      "surface",
      "inset",
      "text",
      "muted",
      "border",
      "brand",
      "secondary",
      "emphasis",
      "series1",
      "series2",
      "series3",
      "series4",
    ].map((key) => [key, z.string().regex(/^\{[^{}]+\}$/)]),
  ),
);
export const presentationSourceSchema = z
  .object({
    schemaVersion: z.literal(1),
    version: z.string().min(1),
    status: z.enum(["candidate", "selected", "approved"]),
    description: z.string().min(1),
    pending: z.array(pending),
    target: z.literal("google-slides"),
    fonts: z.object({
      latin: z.string().min(1),
      body: z.string().min(1),
      weights: z.array(z.union([z.literal(400), z.literal(700)])).min(1),
      reason: z.string(),
    }),
    canvas: z.object({
      width: positive,
      height: positive,
      unit: z.literal("in"),
    }),
    typeScale: z.object({
      cover: positive,
      divider: positive,
      title: positive,
      heading: positive,
      body: positive,
      caption: positive,
    }),
    typeUnit: z.literal("pt"),
    colors,
    assetIds: z.array(z.string().min(1)).min(1),
    rules: z.array(z.string().min(1)).min(1),
    fontSources: z.array(z.url()),
  })
  .strict()
  .superRefine((p, ctx) => {
    if (p.status === "candidate" && p.pending.length === 0)
      ctx.addIssue({
        code: "custom",
        message: "Candidate profile must declare pending validation",
      });
  });

/** Resolve only semantic/component references; do not copy brand values into a profile. */
export function getPresentationProfile(repository: RepositoryData) {
  const profile = presentationSourceSchema.parse(repository.presentation);
  const tokens = new Map(
    [...repository.tokenCategories.values()].flatMap((c) =>
      c.tokens.map((t) => [t.name, t] as const),
    ),
  );
  const resolvedColors = Object.fromEntries(
    Object.entries(profile.colors).map(([role, alias]) => {
      const name = alias.slice(1, -1);
      const token = tokens.get(name);
      if (
        !token ||
        !["semantic", "component"].includes(token.layer ?? "") ||
        token.type !== "color" ||
        !/^#[0-9a-f]{6}$/i.test(token.resolved)
      ) {
        throw new Error(
          `Invalid presentation color reference: ${role}=${name}`,
        );
      }
      return [role, token.resolved];
    }),
  );
  const assets = profile.assetIds.map((id) => {
    const asset = repository.assets.get(id);
    if (
      !asset ||
      !asset.svgSource ||
      asset.status.some(
        (s) => s.status === "undecided" || s.status === "deprecated",
      )
    )
      throw new Error(`Unavailable presentation asset: ${id}`);
    return asset;
  });
  const guideline = repository.guidelines.get("guidelines");
  if (!guideline) throw new Error("Missing design guidelines");
  const { schemaVersion, version, status, pending, ...design } = profile;
  return {
    schemaVersion,
    source: {
      path: "tokens/presentation.json",
      version,
      status,
      pending,
    },
    profile: { ...design, colors: resolvedColors },
    references: { colors: profile.colors },
    assets,
    guideline: { source: guideline.source.path, markdown: guideline.markdown },
  };
}
