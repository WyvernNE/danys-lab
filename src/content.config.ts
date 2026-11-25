import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { postSchema, momentSchema, specSchema, seriesSchema } from "shirones/collections";
import { currentLocaleCode } from "../shirones/i18n/locales.mjs";

// Contenu de la langue en cours de construction : shirones/content/<langue>/.
const root = `./shirones/content/${currentLocaleCode()}`;

/**
 * Shirone content collections — inline schemas for full type safety and Astro
 * typegen support (a schema hidden behind a helper call cannot be
 * introspected). Edit the `base` paths if you moved the content directory;
 * the schemas themselves come from the theme.
 *
 * Generated from the theme's `src/integration/collections.manifest.json`.
 */
const posts = defineCollection({
	loader: glob({ base: `${root}/posts`, pattern: "**/*.{md,mdx}" }),
	// Dates acceptées aussi sous forme de texte ("2026-10-01"), comme les écrit
	// parfois Pages CMS.
	schema: postSchema.extend({
		published: z.coerce.date(),
		updated: z.coerce.date().optional(),
		// Bloc « Expérience #… / Verdict » affiché en tête et en fin d'article
		// (src/components/content/Markdown.astro). Clés identiques dans toutes les langues.
		// Pages CMS peut écrire un bloc vide (champs à null) : on l'ignore alors.
		experience: z.preprocess(
			(v) =>
				v && typeof v === "object" && (v as { number?: unknown }).number != null ? v : undefined,
			z
			.object({
				number: z.number().int().positive(),
				hypothesis: z.string(),
				variable: z.string().nullish(),
				duration: z.string().nullish(),
				// Indice confort sur 10. Absent : moyenne des critères.
				score: z.number().min(0).max(10).nullish(),
				// Critères notés sur 10 (3 au moins pour dessiner le radar).
				// Liste [{ name, score }] (format de Pages CMS) ou dictionnaire { Goût: 8 }.
				criteria: z
					.union([
						z.array(z.object({ name: z.string(), score: z.number().min(0).max(10) })),
						z.record(z.string(), z.number().min(0).max(10)),
					])
					.nullish(),
				keep: z.string().nullish(),
				drop: z.string().nullish(),
				next: z.string().nullish(),
			})
			.optional(),
		),
		// Étude de cas non commandée : affiche le badge « Projet conceptuel ».
		conceptual: z.boolean().nullish(),
		// Contenu sponsorisé : nom du partenaire, affiché en tête (mention obligatoire).
		sponsor: z.string().nullish(),
	}),
});

const moments = defineCollection({
	loader: glob({ base: `${root}/moments`, pattern: "**/*.md" }),
	schema: momentSchema,
});

const spec = defineCollection({
	loader: glob({ base: `${root}/spec`, pattern: "**/*.{md,mdx}" }),
	schema: specSchema,
});

const series = defineCollection({
	loader: glob({ base: `${root}/series`, pattern: "**/*.md" }),
	schema: seriesSchema,
});

export const collections = { posts, moments, spec, series } as const;
