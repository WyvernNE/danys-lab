import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { cooklang, recipeSchema } from './loaders/cooklang';

const contentDir = (name: string) => `./src/content/${name}`;
const markdown = (name: string) => glob({ pattern: '**/*.{md,mdx}', base: contentDir(name) });

const portfolio = defineCollection({
	loader: markdown('portfolio'),
	schema: z.object({
		title: z.string(),
		description: z.string().optional(),
		order: z.number().default(0),
	}),
});

const projects = defineCollection({
	loader: markdown('projects'),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		date: z.coerce.date(),
		tags: z.array(z.string()).default([]),
		url: z.url().optional(),
		repo: z.url().optional(),
		draft: z.boolean().default(false),
	}),
});

const drinks = defineCollection({
	loader: cooklang({ base: contentDir('drinks') }),
	schema: recipeSchema,
});

export const collections = { portfolio, projects, drinks };
