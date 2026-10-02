/**
 * 项目页数据源（纯内容）。
 * 页面展示与筛选规则由 src/config/projectsConfig.ts 控制。
 */
import type { ProjectItem } from "@/types/projectsConfig";
import { currentLocaleCode, localeBase, SITE_ORIGIN } from "../../i18n/locales.mjs";
import { messages } from "../../i18n/messages.mjs";

const items = messages.projects.items;
// Textes traduits dans shirones/i18n/messages/<langue>.json.
const home = `${SITE_ORIGIN}${localeBase(currentLocaleCode())}`;

export const projectsData: ProjectItem[] = [
	{
		key: "danys-lab",
		title: "Dany's Lab",
		summary: items["danys-lab"].summary,
		category: "web",
		phase: "building",
		technologies: ["Astro", "Shirone", "TypeScript", "GitHub Pages"],
		icon: "material-symbols:code-blocks-outline-rounded",
		cover: "/images/projects/danys-lab.webp",
		coverAlt: items["danys-lab"].coverAlt,
		featured: true,
		repository: "https://github.com/WyvernNE/danys-lab",
		website: home,
		year: "2026",
	},
	{
		key: "labo-cafe",
		title: items["labo-cafe"].title,
		summary: items["labo-cafe"].summary,
		category: "cafe",
		phase: "exploring",
		technologies: ["Espresso", "Matcha"],
		icon: "material-symbols:menu-book-rounded",
		cover: "/images/projects/labo-cafe.webp",
		coverAlt: items["labo-cafe"].coverAlt,
		website: `${home}series/labo-cafe/`,
		year: "2026",
	},
];

/** 获取所有项目数据列表 */
export function getProjectsList(): ProjectItem[] {
	return projectsData;
}
