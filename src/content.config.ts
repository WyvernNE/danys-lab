import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { postSchema, momentSchema, specSchema, seriesSchema } from "shirones/collections";

/**
 * Shirone content collections — inline schemas for full type safety and Astro
 * typegen support (a schema hidden behind a helper call cannot be
 * introspected). Edit the `base` paths if you moved the content directory;
 * the schemas themselves come from the theme.
 *
 * Generated from the theme's `src/integration/collections.manifest.json`.
 */
const posts = defineCollection({
	loader: glob({ base: "./shirones/content/posts", pattern: "**/*.{md,mdx}" }),
	// Dates acceptées aussi sous forme de texte ("2026-10-01"), comme les écrit
	// parfois Pages CMS.
	schema: postSchema.extend({
		published: z.coerce.date(),
		updated: z.coerce.date().optional(),
	}),
});

const moments = defineCollection({
	loader: glob({ base: "./shirones/content/moments", pattern: "**/*.md" }),
	schema: momentSchema,
});

const spec = defineCollection({
	loader: glob({ base: "./shirones/content/spec", pattern: "**/*.{md,mdx}" }),
	schema: specSchema,
});

const series = defineCollection({
	loader: glob({ base: "./shirones/content/series", pattern: "**/*.md" }),
	schema: seriesSchema,
});

export const collections = { posts, moments, spec, series } as const;
