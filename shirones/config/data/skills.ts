/**
 * 技能页数据源（纯内容）。
 * 页面展示与筛选规则由 src/config/skillsConfig.ts 控制。
 */
import type { SkillItem } from "@/types/skillsConfig";

// Vide pour l'instant (page désactivée). Exemple complet dans
// node_modules/shirones/template/shirones/config/data/skills.ts
export const skillsData: SkillItem[] = [];

/** 获取所有技能数据列表 */
export function getSkillsList(): SkillItem[] {
	return skillsData;
}
