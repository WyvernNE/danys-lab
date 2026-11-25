/**
 * Données ouvertes : toutes les expériences au format CSV (/experiences.csv).
 */
import type { APIRoute } from "astro";
import { getCriteria, getExperiences } from "../lab/experiences";

const cell = (v: unknown) => {
	const s = v === null || v === undefined ? "" : String(v);
	return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const GET: APIRoute = async ({ site }) => {
	const experiences = await getExperiences();
	const header = ["number", "title", "pillar", "comfort_index", "published", "hypothesis", "criteria", "url"];
	const rows = experiences.map((e) => [
		e.data.number,
		e.post.data.title,
		e.post.data.category ?? "",
		e.score ?? "",
		e.post.data.published.toISOString().slice(0, 10),
		e.data.hypothesis,
		e.data.criteria ? JSON.stringify(getCriteria(e.data)) : "",
		site ? new URL(e.url, site).toString() : e.url,
	]);
	const csv = [header, ...rows].map((r) => r.map(cell).join(",")).join("\n");
	return new Response(`﻿${csv}\n`, {
		headers: { "Content-Type": "text/csv; charset=utf-8" },
	});
};
