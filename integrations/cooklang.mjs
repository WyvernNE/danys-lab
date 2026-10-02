// Convertisseur Cooklang → articles Markdown du thème Shirone.
//
// Les recettes sont écrites en Cooklang dans `shirones/recipes/*.cook`, avec un
// en-tête YAML (titre, date, tags…). À chaque `pnpm dev` / `pnpm build`, elles
// sont converties en articles dans `shirones/content/posts/recettes/<slug>/`
// (dossier généré, ignoré par Git) : le thème les affiche alors comme
// n'importe quel article (séries, tags, recherche, RSS, couverture…).
//
// Syntaxe : https://cooklang.org/docs/spec/
import {
	copyFileSync,
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Parser, quantity_display } from "@cooklang/cooklang";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RECIPES_DIR = join(ROOT, "shirones/recipes");
const POSTS_DIR = join(ROOT, "shirones/content/posts");
const OUTPUT_DIR = join(POSTS_DIR, "recettes");
const IMAGE_EXTS = [".webp", ".jpg", ".jpeg", ".png", ".avif"];

// Valeurs par défaut des recettes : modifiables recette par recette dans l'en-tête.
const DEFAULTS = {
	category: "Labo café",
	series: "labo-cafe",
};

// Champs de l'en-tête Cooklang recopiés tels quels dans l'article.
const PASSTHROUGH = [
	"title",
	"description",
	"tags",
	"category",
	"series",
	"seriesOrder",
	"draft",
	"pinned",
	"updated",
	"lang",
	"sponsor",
];

const parser = new Parser();

// ── Helpers de rendu ────────────────────────────────────────────────────────

function quantity(q) {
	if (!q) return "";
	try {
		return quantity_display(q).replace(/(\d)\.(\d)/g, "$1,$2");
	} catch {
		return "";
	}
}

function formatMinutes(total) {
	if (typeof total !== "number" || !Number.isFinite(total)) return "";
	const h = Math.floor(total / 60);
	const m = Math.round(total % 60);
	if (h && m) return `${h} h ${m} min`;
	if (h) return `${h} h`;
	return `${m} min`;
}

function formatTime(time) {
	if (time == null) return "";
	if (typeof time === "number") return formatMinutes(time);
	if (typeof time === "object") {
		const parts = [];
		const prep = time.prep_time ?? time.prepTime;
		const cook = time.cook_time ?? time.cookTime;
		if (prep) parts.push(`préparation ${formatMinutes(prep)}`);
		if (cook) parts.push(`cuisson ${formatMinutes(cook)}`);
		return parts.join(", ");
	}
	return String(time);
}

function formatServings(servings) {
	if (servings == null) return "";
	if (Array.isArray(servings)) return servings.join(" – ");
	return String(servings);
}

function yamlValue(value) {
	if (Array.isArray(value)) return `[${value.map((v) => yamlValue(v)).join(", ")}]`;
	if (typeof value === "number" || typeof value === "boolean") return String(value);
	return JSON.stringify(String(value));
}

const DATE_KEYS = new Set(["published", "updated"]);

function frontmatter(data) {
	const lines = Object.entries(data)
		.filter(([, v]) => v !== undefined && v !== null && v !== "")
		// Les dates restent sans guillemets pour être lues comme des dates.
		.map(([k, v]) => `${k}: ${DATE_KEYS.has(k) ? toDate(v) : yamlValue(v)}`);
	return `---\n${lines.join("\n")}\n---\n`;
}

function renderItem(item, recipe) {
	switch (item.type) {
		case "text":
			return item.value;
		case "ingredient": {
			const ing = recipe.ingredients[item.index];
			const name = ing.alias ?? ing.name;
			const qty = quantity(ing.quantity);
			return qty ? `**${name}** (${qty})` : `**${name}**`;
		}
		case "cookware": {
			const cw = recipe.cookware[item.index];
			return cw.alias ?? cw.name;
		}
		case "timer": {
			const t = recipe.timers[item.index];
			const qty = quantity(t.quantity);
			return `**${qty || t.name || ""}**`;
		}
		case "inlineQuantity":
			return quantity(recipe.inline_quantities[item.index]);
		default:
			return "";
	}
}

function renderBody(recipe, metadata) {
	const out = [];

	// Notes placées avant la première étape : introduction de l'article.
	const first = recipe.sections[0];
	while (first && !first.name && first.content[0]?.type === "text") {
		out.push(first.content.shift().value.trim(), "");
	}

	// Fiche récapitulative
	const facts = [
		["Portions", formatServings(metadata.servings)],
		["Temps", formatTime(metadata.time)],
		["Difficulté", metadata.difficulty ?? ""],
	].filter(([, v]) => v);
	if (facts.length) {
		out.push(`| ${facts.map(([k]) => k).join(" | ")} |`);
		out.push(`| ${facts.map(() => "---").join(" | ")} |`);
		out.push(`| ${facts.map(([, v]) => v).join(" | ")} |`, "");
	}

	// Ingrédients (une ligne par ingrédient défini, pas par référence)
	const ingredients = recipe.ingredients.filter(
		(i) => i.relation?.relation?.type !== "reference",
	);
	if (ingredients.length) {
		out.push("## Ingrédients", "");
		for (const i of ingredients) {
			const qty = quantity(i.quantity);
			const note = i.note ? ` — ${i.note}` : "";
			out.push(`- ${qty ? `**${qty}** ` : ""}${i.alias ?? i.name}${note}`);
		}
		out.push("");
	}

	// Matériel
	const cookware = recipe.cookware.filter((c) => c.relation?.type !== "reference");
	if (cookware.length) {
		out.push("## Matériel", "");
		for (const c of cookware) {
			const name = c.alias ?? c.name;
			out.push(`- ${name.charAt(0).toUpperCase()}${name.slice(1)}`);
		}
		out.push("");
	}

	// Étapes, section par section
	out.push("## Étapes", "");
	for (const section of recipe.sections) {
		if (section.name) out.push(`### ${section.name}`, "");
		for (const content of section.content) {
			if (content.type === "step") {
				const text = content.value.items.map((it) => renderItem(it, recipe)).join("");
				out.push(`${content.value.number}. ${text.trim()}`);
			} else if (content.type === "text") {
				// Note Cooklang (ligne commençant par « > ») : paragraphe libre.
				out.push("", content.value.trim(), "");
			}
		}
		out.push("");
	}

	return out.join("\n");
}

// ── Conversion ──────────────────────────────────────────────────────────────

function cleanReport(report) {
	return report
		.replace(/<[^>]+>/g, "")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.trim();
}

function findCover(file, image) {
	const dir = dirname(file);
	const candidates = [];
	if (image) {
		candidates.push(resolve(dir, image), resolve(POSTS_DIR, image), join(ROOT, image));
	} else {
		const stem = basename(file, ".cook");
		for (const ext of IMAGE_EXTS) candidates.push(join(dir, `${stem}${ext}`));
	}
	return candidates.find((c) => existsSync(c));
}

function toDate(value) {
	if (!value) return undefined;
	const d = new Date(value);
	return Number.isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10);
}

/**
 * Convertit toutes les recettes `.cook` en articles.
 * @param {{ log?: (msg: string) => void, warn?: (msg: string) => void }} [logger]
 * @returns {number} nombre de recettes converties
 */
export function convertRecipes(logger = {}) {
	const log = logger.log ?? console.log;
	const warn = logger.warn ?? console.warn;

	rmSync(OUTPUT_DIR, { recursive: true, force: true });
	if (!existsSync(RECIPES_DIR)) return 0;

	const files = readdirSync(RECIPES_DIR).filter((f) => f.endsWith(".cook"));
	for (const name of files) {
		const file = join(RECIPES_DIR, name);
		const slug = basename(name, ".cook");
		const { recipe, metadata, report } = parser.parse(readFileSync(file, "utf8"));
		if (report) warn(`[cooklang] ${name}\n${cleanReport(report)}`);

		const rawMap = recipe.raw_metadata?.map ?? {};
		const raw = rawMap instanceof Map ? Object.fromEntries(rawMap) : { ...rawMap };
		const published = toDate(raw.published ?? raw.date);
		if (!published) warn(`[cooklang] ${name} : pas de date « published », date du jour utilisée.`);

		const data = {
			category: DEFAULTS.category,
			series: DEFAULTS.series,
		};
		for (const key of PASSTHROUGH) if (raw[key] !== undefined) data[key] = raw[key];
		data.title ??= slug;
		data.published = published ?? new Date().toISOString().slice(0, 10);
		if (Array.isArray(metadata.tags) && metadata.tags.length) data.tags = metadata.tags;

		const outDir = join(OUTPUT_DIR, slug);
		mkdirSync(outDir, { recursive: true });
		const cover = findCover(file, raw.image);
		if (cover) {
			const target = `cover${extname(cover)}`;
			copyFileSync(cover, join(outDir, target));
			data.image = `./${target}`;
		} else if (raw.image) {
			warn(`[cooklang] ${name} : image introuvable (${raw.image}).`);
		}

		const header = frontmatter({
			title: data.title,
			published: data.published,
			...data,
		});
		const note = `<!-- Généré depuis ${relative(ROOT, file)} : modifie la recette, pas ce fichier. -->\n\n`;
		writeFileSync(join(outDir, "index.md"), `${header}\n${note}${renderBody(recipe, metadata)}`);
	}
	log(`[cooklang] ${files.length} recette(s) convertie(s)`);
	return files.length;
}

/** Intégration Astro : convertit au démarrage et à chaque modification en dev. */
export default function cooklang() {
	return {
		name: "danys-lab:cooklang",
		hooks: {
			"astro:config:setup": ({ logger }) => {
				convertRecipes({ log: (m) => logger.info(m), warn: (m) => logger.warn(m) });
			},
			"astro:server:setup": ({ server, logger }) => {
				server.watcher.add(RECIPES_DIR);
				server.watcher.on("all", (_event, path) => {
					if (!path.startsWith(RECIPES_DIR)) return;
					convertRecipes({ log: (m) => logger.info(m), warn: (m) => logger.warn(m) });
				});
			},
		},
	};
}

// `pnpm recipes` : conversion manuelle, sans lancer Astro.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	convertRecipes();
}
