// Intégration Astro du multilingue.
//
// Le sélecteur de langue du menu (shirones/config/navBarConfig.ts) pointe vers
// l'accueil de chaque langue avec un paramètre `?lang=xx`. Ce script, injecté sur
// toutes les pages, intercepte ces clics pour ouvrir la même page dans l'autre
// langue (ou son accueil si elle n'y existe pas encore), en rechargement complet :
// la navigation sans rechargement du thème (Swup) garderait sinon le menu,
// les réglages et la langue de la page précédente.
import { DEFAULT_LOCALE, LOCALES, SITE_BASE } from "../shirones/i18n/locales.mjs";

function clientScript() {
	const config = {
		base: SITE_BASE,
		defaultLocale: DEFAULT_LOCALE,
		locales: LOCALES.map((l) => l.code),
	};
	return `
const I18N = ${JSON.stringify(config)};
const rootOf = (code) => code === I18N.defaultLocale ? I18N.base : I18N.base + code + "/";

function splitPath(pathname) {
	for (const code of I18N.locales) {
		if (code === I18N.defaultLocale) continue;
		const root = rootOf(code);
		if (pathname === root.slice(0, -1) || pathname.startsWith(root)) {
			return { code, rest: pathname.slice(root.length) };
		}
	}
	return { code: I18N.defaultLocale, rest: pathname.startsWith(I18N.base) ? pathname.slice(I18N.base.length) : "" };
}

async function targetUrl(code) {
	const { rest } = splitPath(location.pathname);
	const candidate = rootOf(code) + rest + location.hash;
	try {
		const res = await fetch(candidate, { method: "HEAD" });
		if (res.ok) return candidate;
	} catch {}
	return rootOf(code);
}

window.addEventListener("click", async (event) => {
	if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
	const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
	if (!link) return;
	const code = new URL(link.href, location.href).searchParams.get("lang");
	if (!code || !I18N.locales.includes(code)) return;
	event.preventDefault();
	event.stopImmediatePropagation();
	location.assign(await targetUrl(code));
}, true);
`;
}

export default function i18n() {
	return {
		name: "danys-lab:i18n",
		hooks: {
			"astro:config:setup": ({ injectScript }) => {
				injectScript("page", clientScript());
			},
		},
	};
}
