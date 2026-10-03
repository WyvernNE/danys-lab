// Langues du site — source unique de vérité.
//
// Ajouter une langue :
//   1. ajouter une entrée ci-dessous (code, label, drapeau, langue du thème) ;
//   2. ajouter une ligne d'import dans `shirones/i18n/messages.mjs` ;
//   3. pousser sur dev : la traduction IA génère tout le contenu, en attente de validation.
//
// Chaque langue est construite comme un site complet : la langue par défaut à
// la racine (/danys-lab/), les autres sous /danys-lab/<code>/.

export const SITE_ORIGIN = "https://wyvernne.github.io";
export const SITE_BASE = "/danys-lab/";

/** Langue dans laquelle Dany écrit : source de toutes les traductions. */
export const DEFAULT_LOCALE = "fr";
// La langue par défaut doit rester la première de LOCALES.

/**
 * @typedef {object} Locale
 * @property {string} code      code court, utilisé dans les URL et les dossiers
 * @property {string} label     nom de la langue, dans la langue elle-même
 * @property {string} flag      drapeau affiché dans le sélecteur
 * @property {string} themeLang code de langue du thème Shirone (dates, interface)
 * @property {string} name      nom anglais, donné à l'IA pour traduire
 */

/** @type {Locale[]} */
export const LOCALES = [
	{ code: "fr", label: "Français", flag: "🇫🇷", themeLang: "fr", name: "French" },
	{ code: "en", label: "English", flag: "🇬🇧", themeLang: "en", name: "English" },
];

/** Langues dont le thème fournit déjà l'interface (boutons, dates…). */
export const THEME_NATIVE_LANGS = ["en", "es", "id", "ja", "ko", "th", "tr", "vi", "zh_CN", "zh_TW"];

/**
 * @param {string} code
 * @returns {Locale} la langue demandée, ou la langue par défaut si elle est inconnue
 */
export function getLocale(code) {
	return LOCALES.find((l) => l.code === code) ?? /** @type {Locale} */ (LOCALES[0]);
}

/** Langue en cours de construction (variable PUBLIC_SITE_LOCALE, défaut : français). */
export function currentLocaleCode() {
	const fromNode = typeof process !== "undefined" ? process.env?.PUBLIC_SITE_LOCALE : undefined;
	const fromVite = import.meta.env?.PUBLIC_SITE_LOCALE;
	const code = fromNode || fromVite || DEFAULT_LOCALE;
	return LOCALES.some((l) => l.code === code) ? code : DEFAULT_LOCALE;
}

/** Préfixe d'URL d'une langue : "/danys-lab/" ou "/danys-lab/en/". */
export function localeBase(code) {
	return code === DEFAULT_LOCALE ? SITE_BASE : `${SITE_BASE}${code}/`;
}
