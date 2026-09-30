import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { cooklang } from './loaders/cooklang';

const portfolio = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/portfolio' }),
	schema: z.object({
		title: z.string(),
		description: z.string().optional(),
		order: z.number().default(0),
	}),
});

const projects = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
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

const quantity = z.union([z.string(), z.number()]);

const ingredient = z.object({
	type: z.literal('ingredient'),
	name: z.string(),
	quantity,
	units: z.string(),
	step: z.number().optional(),
});

const cookware = z.object({
	type: z.literal('cookware'),
	name: z.string(),
	quantity,
	step: z.number().optional(),
});

const timer = z.object({
	type: z.literal('timer'),
	name: z.string().optional(),
	quantity,
	units: z.string(),
});

const text = z.object({ type: z.literal('text'), value: z.string() });

const drinks = defineCollection({
	loader: cooklang({ base: './src/content/drinks' }),
	schema: z.object({
		// Cooklang `>> key: value` lines; every value is a string.
		metadata: z.record(z.string(), z.string()),
		ingredients: z.array(ingredient),
		cookwares: z.array(cookware),
		steps: z.array(z.array(z.discriminatedUnion('type', [ingredient, cookware, timer, text]))),
	}),
});

export const collections = { portfolio, projects, drinks };
