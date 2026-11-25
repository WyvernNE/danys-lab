/**
 * Données « Expérience » de Dany's Lab, calculées au build.
 * Source : le bloc `experience` dans l'en-tête des articles et des recettes.
 */
import type { CollectionEntry } from "astro:content";
import { getSortedPosts } from "@utils/content-utils";
import { getPostUrl } from "@utils/url-utils";
import { labConfig } from "../../shirones/labConfig";
import { messages } from "../../shirones/i18n/messages.mjs";

type Post = CollectionEntry<"posts">;
export type ExperienceData = NonNullable<Post["data"]["experience"]>;

export interface Experience {
	post: Post;
	url: string;
	data: ExperienceData;
	/** Indice confort (donné, ou moyenne des critères), arrondi au dixième. */
	score: number | null;
	/** Expérience précédente notée dans le même pilier. */
	previous: { number: number; score: number } | null;
	/** Écart avec l'expérience précédente du même pilier. */
	delta: number | null;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Critères sous forme de dictionnaire { nom: note }, quel que soit le format saisi. */
export function getCriteria(data: ExperienceData): Record<string, number> {
	const c = data.criteria;
	if (!c) return {};
	if (Array.isArray(c)) return Object.fromEntries(c.map((x) => [x.name, x.score]));
	return c;
}

export function computeScore(data: ExperienceData): number | null {
	if (typeof data.score === "number") return round1(data.score);
	const values = Object.values(getCriteria(data));
	if (!values.length) return null;
	return round1(values.reduce((a, b) => a + b, 0) / values.length);
}

/** Toutes les expériences publiées, triées par numéro. */
export async function getExperiences(): Promise<Experience[]> {
	const posts = (await getSortedPosts()).filter((p) => p.data.experience);
	const sorted = posts.sort(
		(a, b) => a.data.experience!.number - b.data.experience!.number,
	);
	const lastByPillar = new Map<string, { number: number; score: number }>();
	return sorted.map((post) => {
		const data = post.data.experience!;
		const score = computeScore(data);
		const pillar = post.data.category ?? "";
		const previous = lastByPillar.get(pillar) ?? null;
		const delta =
			previous && score !== null ? round1(score - previous.score) : null;
		if (score !== null) lastByPillar.set(pillar, { number: data.number, score });
		return { post, url: getPostUrl(post), data, score, previous, delta };
	});
}

/** Expérience correspondant à une adresse de page (ou null). */
export async function findExperienceByPath(
	pathname: string,
): Promise<Experience | null> {
	const clean = (p: string) => decodeURI(p).replace(/\/+$/, "");
	const target = clean(pathname);
	const all = await getExperiences();
	return all.find((e) => clean(e.url) === target) ?? null;
}

/** Article correspondant à une adresse de page (ou null). */
export async function findPostByPath(pathname: string): Promise<Post | null> {
	const clean = (p: string) => decodeURI(p).replace(/\/+$/, "");
	const target = clean(pathname);
	const posts = await getSortedPosts();
	return posts.find((p) => clean(getPostUrl(p)) === target) ?? null;
}

/** « 7 » → « #007 » */
export const formatNumber = (n: number) => `#${String(n).padStart(3, "0")}`;

/** Score au format de la langue : 7.8 → « 7,8 » en français. */
export function formatScore(n: number, lang: string): string {
	return n.toLocaleString(lang, {
		minimumFractionDigits: 1,
		maximumFractionDigits: 1,
	});
}

/** Les 4 piliers avec leurs textes traduits. */
export function getPillars() {
	const texts = messages.lab.pillars as Record<
		string,
		{ name: string; description: string }
	>;
	return labConfig.pillars.map((p) => ({ ...p, ...texts[p.key] }));
}
