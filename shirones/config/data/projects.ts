/**
 * 项目页数据源（纯内容）。
 * 页面展示与筛选规则由 src/config/projectsConfig.ts 控制。
 */
import type { ProjectItem } from "@/types/projectsConfig";

export const projectsData: ProjectItem[] = [
	{
		key: "danys-lab",
		title: "Dany's Lab",
		summary:
			"Ce site : portfolio, blog et carnet de recettes café, construit avec Astro et le thème Shirone.",
		category: "web",
		phase: "building",
		technologies: ["Astro", "Shirone", "TypeScript", "GitHub Pages"],
		icon: "material-symbols:science-outline-rounded",
		featured: true,
		repository: "https://github.com/WyvernNE/danys-lab",
		website: "https://wyvernne.github.io/danys-lab/",
		year: "2026",
	},
	{
		key: "labo-cafe",
		title: "Labo café",
		summary:
			"Mes recettes de boissons notées et testées : ratios, températures et temps d'extraction.",
		category: "cafe",
		phase: "exploring",
		technologies: ["Espresso", "Matcha"],
		icon: "material-symbols:coffee-outline-rounded",
		website: "https://wyvernne.github.io/danys-lab/series/labo-cafe/",
		year: "2026",
	},
];

/** 获取所有项目数据列表 */
export function getProjectsList(): ProjectItem[] {
	return projectsData;
}
