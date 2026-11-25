import type { ProfileConfig } from "@/types/config";
import { withUserConfig } from "@/utils/config-overlay.ts";
import { messages } from "../i18n/messages.mjs";
import { labConfig } from "../labConfig";

// Liens remplis dans shirones/labConfig.ts ; un lien vide est masqué.
const socialLinks = [
	{ name: "Instagram", icon: "fa6-brands:instagram", url: labConfig.links.instagram },
	{ name: "YouTube", icon: "fa6-brands:youtube", url: labConfig.links.youtube },
	{ name: "GitHub", icon: "fa6-brands:github", url: labConfig.links.github },
].filter((link) => link.url);

/**
 * 博主资料：头像 / 名称 / 简介 / 社交链接（侧栏 Profile 卡片、页脚、RSS 作者等消费）。
 * 类型见 src/types/config.ts。
 */
export const profileConfig: ProfileConfig = withUserConfig("profile", {
	avatar: "../shirones/assets/avatar.webp", // Chemin relatif à src/ (donc ../shirones/…) ; commencer par "/" pour un fichier de public/
	name: "Dany",
	bio: messages.profile.bio,
	links: socialLinks,
});
