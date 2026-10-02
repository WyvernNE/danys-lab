// Lance Astro pour une ou plusieurs langues.
//
//   pnpm build          → construit toutes les langues et les assemble dans dist/
//                         (français à la racine, les autres dans dist/<code>/)
//   pnpm dev            → serveur de dev en français
//   pnpm dev:en         → serveur de dev en anglais (node scripts/site.mjs dev en)
//   pnpm preview        → sert dist/ (toutes les langues) après un build
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { DEFAULT_LOCALE, LOCALES } from "../shirones/i18n/locales.mjs";

const [command = "build", locale = DEFAULT_LOCALE, ...rest] = process.argv.slice(2);
const BUILD_DIR = ".build";

function astro(args, code, extraEnv = {}) {
	const result = spawnSync("astro", args, {
		stdio: "inherit",
		shell: process.platform === "win32",
		env: { ...process.env, PUBLIC_SITE_LOCALE: code, ...extraEnv },
	});
	if (result.status !== 0) process.exit(result.status ?? 1);
}

if (command === "build") {
	rmSync(BUILD_DIR, { recursive: true, force: true });
	for (const { code } of LOCALES) {
		console.log(`\n━━━ Construction : ${code} ━━━\n`);
		astro(["build", ...rest], code, { ASTRO_OUT_DIR: join(BUILD_DIR, code) });
	}
	rmSync("dist", { recursive: true, force: true });
	mkdirSync("dist");
	cpSync(join(BUILD_DIR, DEFAULT_LOCALE), "dist", { recursive: true });
	for (const { code } of LOCALES) {
		if (code !== DEFAULT_LOCALE) cpSync(join(BUILD_DIR, code), join("dist", code), { recursive: true });
	}
	rmSync(BUILD_DIR, { recursive: true, force: true });
	console.log(`\n✓ dist/ prêt : ${LOCALES.map((l) => l.code).join(", ")}`);
} else if (command === "dev") {
	astro(["dev", ...rest], locale);
} else if (command === "preview") {
	if (!existsSync("dist")) {
		console.error("Lance d'abord `pnpm build`.");
		process.exit(1);
	}
	astro(["preview", ...rest], DEFAULT_LOCALE);
} else {
	console.error(`Commande inconnue : ${command} (build | dev [langue] | preview)`);
	process.exit(1);
}
