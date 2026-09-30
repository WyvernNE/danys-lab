import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { Recipe } from '@cooklang/cooklang-ts';
import type { Loader } from 'astro/loaders';
import { z } from 'astro/zod';

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

/** Shape of a parsed recipe, as produced by @cooklang/cooklang-ts. */
export const recipeSchema = z.object({
	// Cooklang `>> key: value` lines; every value is a string.
	metadata: z.record(z.string(), z.string()),
	ingredients: z.array(ingredient),
	cookwares: z.array(cookware),
	steps: z.array(z.array(z.discriminatedUnion('type', [ingredient, cookware, timer, text]))),
});

const toPosix = (p: string) => p.replace(/\\/g, '/');

/**
 * Content loader for Cooklang recipes (`.cook`).
 * Each file becomes an entry whose id is its path relative to `base`, without extension.
 */
export function cooklang({ base }: { base: string }): Loader {
	return {
		name: 'cooklang-loader',
		load: async ({ config, store, parseData, generateDigest, watcher, logger }) => {
			const root = fileURLToPath(config.root);
			const baseDir = path.resolve(root, base);
			const toId = (file: string) => toPosix(path.relative(baseDir, file)).replace(/\.cook$/, '');

			async function loadFile(file: string) {
				const source = await readFile(file, 'utf-8');
				const { metadata, ingredients, cookwares, steps } = new Recipe(source);
				const id = toId(file);
				const data = await parseData({ id, data: { metadata, ingredients, cookwares, steps }, filePath: file });
				store.set({
					id,
					data,
					body: source,
					filePath: toPosix(path.relative(root, file)),
					digest: generateDigest(source),
				});
			}

			store.clear();
			const entries = await readdir(baseDir, { recursive: true, withFileTypes: true }).catch(() => []);
			const files = entries
				.filter((e) => e.isFile() && e.name.endsWith('.cook'))
				.map((e) => path.join(e.parentPath, e.name));
			await Promise.all(files.map(loadFile));
			logger.info(`Loaded ${files.length} recipe(s)`);

			if (!watcher) return;
			watcher.add(baseDir);
			const isRecipe = (file: string) => file.startsWith(baseDir) && file.endsWith('.cook');
			watcher.on('add', (file) => isRecipe(file) && loadFile(file));
			watcher.on('change', (file) => isRecipe(file) && loadFile(file));
			watcher.on('unlink', (file) => isRecipe(file) && store.delete(toId(file)));
		},
	};
}
