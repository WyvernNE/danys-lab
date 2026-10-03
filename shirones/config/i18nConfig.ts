import type { I18nConfig } from "@/types/i18nConfig.ts";
import { withUserConfig } from "@/utils/config-overlay.ts";
import { currentLocaleCode, getLocale } from "../i18n/locales.mjs";
import { getThemeOverrides } from "../i18n/messages.mjs";

/**
 * Libellés de l'interface du thème pour la langue en cours de construction.
 *
 * Le thème ne fournit pas le français : sa traduction vit dans
 * `shirones/i18n/messages/fr.json` (section « theme »). Pour les langues que le
 * thème connaît (anglais…), aucun remplacement n'est appliqué.
 * Les marqueurs entre accolades ({page}, {days}…) doivent rester tels quels.
 */
const locale = getLocale(currentLocaleCode());

export const i18nConfig: I18nConfig = withUserConfig("i18n", {
	[locale.themeLang]: getThemeOverrides(locale.code),
});
