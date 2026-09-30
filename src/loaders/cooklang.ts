import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { Recipe } from '@cooklang/cooklang-ts';
import type { Loader, LoaderContext } from 'astro/loaders';

interface CooklangLoaderOptions {
	/** Directory containing the .cook files, relative to the project root. */
	base: string;
}

/**
 * Content loader for Cooklang recipes (`.cook`).
 * Each file becomes an entry whose id is its path relative to `base`, without extension.
 */
export function cooklang({ base }: CooklangLoaderOptions): Loader {
	return {
		name: 'cooklang-loader',
		load: async ({ config, store, parseData, generateDigest, watcher, logger }: LoaderContext) => {
			const baseDir = path.resolve(fileURLToPath(config.root), base);

			const toId = (file: string) =>
				path.relative(baseDir, file).replace(/\\/g, '/').replace(/\.cook$/, '');

			async function loadFile(file: string) {
				const source = await readFile(file, 'utf-8');
				const recipe = new Recipe(source);
				const id = toId(file);
				const data = await parseData({
					id,
					data: {
						metadata: recipe.metadata,
						ingredients: recipe.ingredients,
						cookwares: recipe.cookwares,
						steps: recipe.steps,
					},
					filePath: file,
				});
				store.set({
					id,
					data,
					body: source,
					filePath: path.relative(fileURLToPath(config.root), file).replace(/\\/g, '/'),
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
