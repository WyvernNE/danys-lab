// Textes propres au site (hors articles), par langue.
// `fr.json` est la source ; les autres fichiers sont générés par la traduction IA.
// Une clé absente d'une langue retombe sur sa valeur française.
import { currentLocaleCode, DEFAULT_LOCALE } from "./locales.mjs";
import en from "./messages/en.json" with { type: "json" };
import fr from "./messages/fr.json" with { type: "json" };

// Ajouter une langue : importer son fichier ici et l'ajouter à cette table.
const ALL = { fr, en };

function merge(base, over) {
	if (Array.isArray(base) || typeof base !== "object" || base === null) return over ?? base;
	const out = { ...base };
	for (const [k, v] of Object.entries(over ?? {})) out[k] = merge(base[k], v);
	return out;
}

/** Textes de la langue demandée (par défaut : celle en cours de construction). */
export function getMessages(code = currentLocaleCode()) {
	return merge(ALL[DEFAULT_LOCALE], code === DEFAULT_LOCALE ? {} : ALL[code]);
}

export const messages = getMessages();

/**
 * Libellés de l'interface du thème pour une langue, SANS repli sur le français :
 * pour l'anglais (et les autres langues gérées par le thème), on garde ceux du thème.
 */
export function getThemeOverrides(code = currentLocaleCode()) {
	return ALL[code]?.theme ?? {};
}
