/**
 * 时间线页数据源（纯内容）。
 * 页面展示与筛选规则由 src/config/timelineConfig.ts 控制。
 */
import type { TimelineItem } from "@/types/timelineConfig";

// Vide pour l'instant (page désactivée). Exemple complet dans
// node_modules/shirones/template/shirones/config/data/timeline.ts
export const timelineData: TimelineItem[] = [];

/** 获取所有时间线数据列表 */
export function getTimelineList(): TimelineItem[] {
	return timelineData;
}
