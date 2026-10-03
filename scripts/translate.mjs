// Traduction automatique du contenu français vers les autres langues, avec Claude.
//
//   pnpm translate                 traduit ce qui a changé depuis la dernière fois
//   pnpm translate --locale en     une seule langue
//   pnpm translate --dry-run       liste ce qui serait traduit, sans appeler l'IA
//   pnpm translate --accept        marque les traductions actuelles comme à jour
//                                  (après une traduction faite à la main)
//   pnpm translate --check         vérifie les traductions existantes (structure, quantités…)
//   pnpm translate --report <f>    écrit un résumé Markdown (corps de la PR)
//
// Sources (français) → cibles (une par langue) :
//   shirones/content/fr/**        → shirones/content/<code>/**   (articles, séries, À propos)
//   shirones/recipes/fr/*         → shirones/recipes/<code>/*    (recettes Cooklang + images)
//   shirones/i18n/messages/fr.json → shirones/i18n/messages/<code>.json (textes du site)
//
// Un fichier n'est retraduit que si sa source a changé : l'empreinte de chaque
// source traduite est gardée dans shirones/i18n/translations.lock.json.
// Les images et autres fichiers non textuels sont simplement copiés.
// En CI (.github/workflows/translate.yml), le résultat part dans une pull request :
// rien n'est publié tant qu'elle n'est pas relue et fusionnée.
import { createHash } from "node:crypto";
import {
	copyFileSync,
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { dirname, extname, join } from "node:path";
import { parseArgs } from "node:util";
import Anthropic from "@anthropic-ai/sdk";
import { Parser } from "@cooklang/cooklang";
import {
	DEFAULT_LOCALE,
	getLocale,
	LOCALES,
	localeBase,
	SITE_BASE,
	THEME_NATIVE_LANGS,
} from "../shirones/i18n/locales.mjs";

const MODEL = "claude-opus-5-5";
const LOCK_FILE = "shirones/i18n/translations.lock.json";
const TEXT_EXTS = new Set([".md", ".mdx", ".cook", ".json"]);

const { values: args } = parseArgs({
	options: {
		locale: { type: "string" },
		"dry-run": { type: "boolean", default: false },
		accept: { type: "boolean", default: false },
		check: { type: "boolean", default: false },
		report: { type: "string" },
	},
});

// ── Inventaire des sources ──────────────────────────────────────────────────

/** Groupes de fichiers à traduire : source française → cible par langue. */
const GROUPS = [
	{
		id: "content",
		source: (code) => `shirones/content/${code}`,
		// Les recettes converties sont régénérées à chaque build : on ne les traduit pas.
		skip: (rel) => rel.startsWith("posts/recettes/"),
	},
	{ id: "recipes", source: (code) => `shirones/recipes/${code}`, skip: () => false },
	{
		id: "messages",
		source: () => "shirones/i18n/messages",
		only: (code) => `${code}.json`,
		skip: () => false,
	},
];

function walk(dir) {
	if (!existsSync(dir)) return [];
	return readdirSync(dir).flatMap((name) => {
		const path = join(dir, name);
		return statSync(path).isDirectory() ? walk(path).map((p) => join(name, p)) : [name];
	});
}

function sources() {
	const items = [];
	for (const group of GROUPS) {
		const dir = group.source(DEFAULT_LOCALE);
		const files = group.only ? [group.only(DEFAULT_LOCALE)] : walk(dir);
		for (const rel of files) {
			if (group.skip(rel)) continue;
			const path = join(dir, rel);
			if (!existsSync(path)) continue;
			items.push({
				key: `${group.id}:${group.only ? "" : rel}`,
				group,
				rel,
				path,
				target: (code) => join(group.source(code), group.only ? group.only(code) : rel),
			});
		}
	}
	return items;
}

const sha = (buf) => createHash("sha256").update(buf).digest("hex").slice(0, 16);

function readLock() {
	return existsSync(LOCK_FILE) ? JSON.parse(readFileSync(LOCK_FILE, "utf8")) : {};
}

function writeLock(lock) {
	const sorted = Object.fromEntries(
		Object.entries(lock)
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([code, entries]) => [code, Object.fromEntries(Object.entries(entries).sort(([a], [b]) => a.localeCompare(b)))]),
	);
	writeFileSync(LOCK_FILE, `${JSON.stringify(sorted, null, "\t")}\n`);
}

function fileType(path) {
	const ext = extname(path);
	if (ext === ".cook") return "cooklang";
	if (ext === ".json") return "json";
	return "markdown";
}

// ── Préparation et vérification ─────────────────────────────────────────────

/** Les libellés d'interface ne sont traduits que pour les langues que le thème ne connaît pas. */
function prepareSource(item, code, text) {
	if (item.group.id !== "messages") return text;
	const data = JSON.parse(text);
	if (THEME_NATIVE_LANGS.includes(getLocale(code).themeLang)) delete data.theme;
	return `${JSON.stringify(data, null, "\t")}\n`;
}

/** Liens internes : /danys-lab/xxx → /danys-lab/<code>/xxx (déterministe, pas confié à l'IA). */
function localizeLinks(text, code) {
	const others = LOCALES.map((l) => l.code).filter((c) => c !== DEFAULT_LOCALE);
	const base = SITE_BASE.replace(/[/]/g, "\\/");
	const pattern = new RegExp(`(\\]\\(|href=["'])${base}(?!(?:${others.join("|")})\\/)`, "g");
	return text.replace(pattern, `$1${localeBase(code)}`);
}

const PRESERVED_KEYS = [
	"published",
	"updated",
	"image",
	"series",
	"seriesOrder",
	"draft",
	"pinned",
	"permalink",
	"alias",
	"encrypted",
	"password",
	"status",
	"servings",
];

function frontmatterOf(text) {
	const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
	if (!match) return null;
	const fields = {};
	for (const line of match[1].split(/\r?\n/)) {
		const m = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
		if (m) fields[m[1]] = m[2].trim();
	}
	return fields;
}

const count = (text, re) => (text.match(re) ?? []).length;

const cooklang = new Parser();
function parseCook(text) {
	const { recipe, report } = cooklang.parse(text);
	return { recipe, report };
}

function jsonShape(value) {
	if (Array.isArray(value)) return `[${value.map(jsonShape).join(",")}]`;
	if (value && typeof value === "object") {
		return `{${Object.keys(value).sort().map((k) => `${k}:${jsonShape(value[k])}`).join(",")}}`;
	}
	return typeof value;
}

/** Renvoie la liste des problèmes (vide = traduction acceptée). */
function validate(type, source, translated) {
	const problems = [];
	if (!translated.trim()) return ["traduction vide"];

	if (type === "json") {
		let a;
		let b;
		try {
			a = JSON.parse(source);
			b = JSON.parse(translated);
		} catch (e) {
			return [`JSON invalide : ${e.message}`];
		}
		if (jsonShape(a) !== jsonShape(b)) problems.push("structure JSON différente (clés ou listes)");
		const placeholders = (s) => (s.match(/\{\w+\}/g) ?? []).sort().join(",");
		if (placeholders(source) !== placeholders(translated)) problems.push("marqueurs {…} modifiés");
		return problems;
	}

	const fa = frontmatterOf(source);
	const fb = frontmatterOf(translated);
	if (Boolean(fa) !== Boolean(fb)) problems.push("en-tête (front matter) ajouté ou supprimé");
	if (fa && fb) {
		const keysA = Object.keys(fa).sort().join(",");
		const keysB = Object.keys(fb).sort().join(",");
		if (keysA !== keysB) problems.push(`champs d'en-tête différents (${keysA} ≠ ${keysB})`);
		for (const key of PRESERVED_KEYS) {
			if (fa[key] !== undefined && fa[key] !== fb[key]) problems.push(`champ « ${key} » modifié`);
		}
	}
	for (const [label, re] of [
		["blocs de code", /^```/gm],
		["images", /!\[/g],
		["directives ::", /^::\w+/gm],
		["titres", /^#{1,6} /gm],
	]) {
		if (count(source, re) !== count(translated, re)) problems.push(`nombre de ${label} différent`);
	}

	if (type === "cooklang") {
		const a = parseCook(source);
		const b = parseCook(translated);
		if (b.report && !a.report) problems.push("la recette traduite ne se lit plus en Cooklang");
		const sameLength = (k) => a.recipe[k].length === b.recipe[k].length;
		for (const [k, label] of [
			["ingredients", "ingrédients"],
			["cookware", "ustensiles"],
			["timers", "minuteurs"],
		]) {
			if (!sameLength(k)) problems.push(`nombre de ${label} différent`);
		}
		const amounts = (r) => [...r.ingredients, ...r.timers].map((i) => JSON.stringify(i.quantity?.value ?? null)).join("|");
		if (sameLength("ingredients") && sameLength("timers") && amounts(a.recipe) !== amounts(b.recipe)) {
			problems.push("quantités ou durées modifiées");
		}
		const sections = (r) => r.sections.length;
		if (sections(a.recipe) !== sections(b.recipe)) problems.push("nombre de sections différent");
	}
	return problems;
}

// ── Appel à Claude ──────────────────────────────────────────────────────────

const SYSTEM = `You translate the files of a personal website — a blog, a portfolio and coffee recipes written by Dany — from French into another language. You receive one file and return the complete translated file.

Return the translated file between <file> and </file>, with nothing before or after: no notes, no explanations.

Keep everything that is not natural-language prose exactly as it is: front matter keys, dates, numbers, URLs and link targets, image and file paths, slugs and identifiers, HTML, code blocks and inline code, Markdown syntax, directives such as ::github{...}, and emoji. In front matter, translate only the values of title, description, tags, category, defaultCategory, time and difficulty; copy every other line unchanged.

Cooklang recipes (.cook): keep every marker with its braces — @ingredient{quantity%unit}, #cookware{}, ~{quantity%unit} — and the lines starting with "== " (section titles: translate the title, keep the == markers), "> " (notes) and "-- " (comments). Translate ingredient and cookware names and the prose. A unit may become its usual equivalent in the target language ("c. à café" → "tsp"), but never change a number, and keep the timer units s, min and h as they are. A multi-word name is directly followed by its braces: @oat milk{180%ml}.

JSON: keep every key, the nesting and the list lengths; translate only the string values. Placeholders in braces such as {page}, {days} or {title} stay unchanged.

Write naturally for a native reader of the target language, in the same friendly and concise tone as the original — not word for word. Keep the names Dany, Dany's Lab, Shirone and Cooklang.`;

let client;
async function translate(item, code, text) {
	const locale = getLocale(code);
	const type = fileType(item.path);
	const stream = client.beta.messages.stream({
		model: MODEL,
		max_tokens: 64000,
		// En cas de refus du modèle, l'API réessaie automatiquement sur un modèle de repli.
		betas: ["server-side-fallback-2026-07-01"],
		fallbacks: "default",
		output_config: { effort: "medium" },
		system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
		messages: [
			{
				role: "user",
				content: `Target language: ${locale.name} (${locale.code}).\nFile: ${item.rel || "messages.json"} (${type})\n\n<source>\n${text}\n</source>`,
			},
		],
	});
	const message = await stream.finalMessage();
	if (message.stop_reason === "refusal") {
		throw new Error(`refus du modèle (${message.stop_details?.category ?? "sans catégorie"})`);
	}
	if (message.stop_reason === "max_tokens") throw new Error("réponse tronquée (fichier trop long)");
	const output = message.content
		.filter((b) => b.type === "text")
		.map((b) => b.text)
		.join("");
	const match = /<file>\r?\n?([\s\S]*?)\r?\n?<\/file>/.exec(output);
	if (!match) throw new Error("réponse sans balises <file>");
	return `${match[1].replace(/\s+$/, "")}\n`;
}

async function translateWithChecks(item, code, source) {
	const type = fileType(item.path);
	let lastProblems = [];
	for (let attempt = 1; attempt <= 2; attempt++) {
		const translated = localizeLinks(await translate(item, code, source), code);
		lastProblems = validate(type, source, translated);
		if (!lastProblems.length) return translated;
		console.warn(`  ⚠ essai ${attempt} refusé : ${lastProblems.join(" ; ")}`);
	}
	throw new Error(lastProblems.join(" ; "));
}

// ── Programme principal ─────────────────────────────────────────────────────

const targets = LOCALES.filter((l) => l.code !== DEFAULT_LOCALE && (!args.locale || l.code === args.locale));
if (args.locale && !targets.length) {
	console.error(`Langue inconnue : ${args.locale}`);
	process.exit(1);
}

if (!args["dry-run"] && !args.accept && !args.check) {
	try {
		client = new Anthropic();
	} catch (error) {
		console.error(`Impossible de joindre l'API Claude : ${error.message}\nDéfinis ANTHROPIC_API_KEY (secret du dépôt en CI).`);
		process.exit(1);
	}
}

const lock = readLock();
const items = sources();
const report = { translated: [], copied: [], removed: [], failed: [] };

for (const { code } of targets) {
	const entries = (lock[code] ??= {});
	console.log(`\n━━━ ${code} ━━━`);

	for (const item of items) {
		const buf = readFileSync(item.path);
		const hash = sha(buf);
		const target = item.target(code);
		const upToDate = entries[item.key] === hash && existsSync(target);
		const isText = TEXT_EXTS.has(extname(item.path));

		if (args.accept) {
			if (existsSync(target)) entries[item.key] = hash;
			continue;
		}
		if (args.check) {
			if (isText && existsSync(target)) {
				const source = prepareSource(item, code, buf.toString("utf8"));
				const problems = validate(fileType(item.path), source, readFileSync(target, "utf8"));
				console.log(`  ${problems.length ? "✗" : "✓"} ${target}${problems.length ? ` : ${problems.join(" ; ")}` : ""}`);
				if (problems.length) report.failed.push(`${code}: ${target} — ${problems.join(" ; ")}`);
			}
			continue;
		}
		if (upToDate) continue;

		if (!isText) {
			if (!args["dry-run"]) {
				mkdirSync(dirname(target), { recursive: true });
				copyFileSync(item.path, target);
				entries[item.key] = hash;
			}
			report.copied.push(`${code}: ${target}`);
			console.log(`  copie   ${target}`);
			continue;
		}

		console.log(`  ${args["dry-run"] ? "à traduire" : "traduction"} ${target}`);
		if (args["dry-run"]) {
			report.translated.push(`${code}: ${target}`);
			continue;
		}
		try {
			const source = prepareSource(item, code, buf.toString("utf8"));
			const translated = await translateWithChecks(item, code, source);
			mkdirSync(dirname(target), { recursive: true });
			writeFileSync(target, translated);
			entries[item.key] = hash;
			report.translated.push(`${code}: ${target}`);
		} catch (error) {
			if (error instanceof Anthropic.AuthenticationError) {
				console.error("Clé API refusée (401) : vérifie le secret ANTHROPIC_API_KEY.");
				process.exit(1);
			}
			const reason = error instanceof Anthropic.APIError ? `erreur API ${error.status} : ${error.message}` : error.message;
			console.error(`  ✗ ${target} : ${reason}`);
			report.failed.push(`${code}: ${target} — ${reason}`);
		}
	}

	// Sources supprimées : on retire leurs traductions.
	const live = new Set(items.map((i) => i.key));
	for (const key of Object.keys(entries)) {
		if (live.has(key)) continue;
		const [groupId, rel] = [key.slice(0, key.indexOf(":")), key.slice(key.indexOf(":") + 1)];
		const group = GROUPS.find((g) => g.id === groupId);
		const target = group && join(group.source(code), group.only ? group.only(code) : rel);
		if (args.check) continue;
		if (!args["dry-run"] && !args.accept) {
			if (target) rmSync(target, { force: true });
			delete entries[key];
		}
		report.removed.push(`${code}: ${target ?? key}`);
		console.log(`  retrait ${target ?? key}`);
	}
}

if (!args["dry-run"] && !args.check) writeLock(lock);

if (args.report) {
	const list = (title, rows) => (rows.length ? `### ${title}\n\n${rows.map((r) => `- \`${r}\``).join("\n")}\n\n` : "");
	writeFileSync(
		args.report,
		`${list("Traduits par l'IA — à relire", report.translated)}${list("Images copiées", report.copied)}${list("Supprimés (source française retirée)", report.removed)}${list("⚠️ Échecs (non traduits)", report.failed)}`,
	);
}

const total = report.translated.length + report.copied.length + report.removed.length;
console.log(`\n${args.accept ? "Empreintes enregistrées." : `${total} changement(s), ${report.failed.length} échec(s).`}`);
if (report.failed.length) process.exitCode = 1;

