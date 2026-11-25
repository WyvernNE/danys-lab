/**
 * Réglages propres à Dany's Lab (hors thème Shirone).
 *
 * Laisse un lien vide ("") tant qu'il n'existe pas : le site le masque
 * automatiquement (ou affiche « bientôt » pour Luma).
 */
export const labConfig = {
	links: {
		/** Page Luma des events, ex. "https://lu.ma/dany" */
		luma: "",
		/** ex. "https://www.instagram.com/ton-compte" */
		instagram: "",
		/** ex. "https://www.youtube.com/@ton-compte" */
		youtube: "",
		/** Adresse de contact pour les collaborations, ex. "hello@exemple.ch" */
		email: "",
		github: "https://github.com/WyvernNE",
	},
	/**
	 * Les 4 piliers, dans l'ordre d'affichage. `key` relie un pilier à ses
	 * textes (`lab.pillars.<key>` dans shirones/i18n/messages/<langue>.json) ;
	 * la catégorie d'un article doit porter le nom traduit du pilier.
	 */
	pillars: [
		{ key: "boire", icon: "material-symbols:coffee-outline-rounded" },
		{ key: "bouger", icon: "material-symbols:directions-run-rounded" },
		{ key: "berne", icon: "material-symbols:map-outline-rounded" },
		{ key: "batir", icon: "material-symbols:construction-rounded" },
	],
} as const;

export type PillarKey = (typeof labConfig.pillars)[number]["key"];
