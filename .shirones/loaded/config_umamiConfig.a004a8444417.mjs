import { createRequire as __shironesCreateRequire } from 'node:module';
const require = __shironesCreateRequire(import.meta.url);

// node_modules/.pnpm/shirones@0.1.5_e99f9125c288bdf9f0113d8653260a09/node_modules/shirones/src/user/user-config.ts
var userConfigOverrides = {};

// node_modules/.pnpm/shirones@0.1.5_e99f9125c288bdf9f0113d8653260a09/node_modules/shirones/src/utils/config-overlay.ts
function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function deepMerge(base, override) {
  if (!isPlainObject(base) || !isPlainObject(override)) return override;
  const merged = { ...base };
  for (const [key, value] of Object.entries(override)) {
    merged[key] = key in base ? deepMerge(base[key], value) : value;
  }
  return merged;
}
function withUserConfig(domain, defaults) {
  const override = userConfigOverrides[domain];
  if (override === void 0) return defaults;
  return deepMerge(defaults, override);
}

// shirones/config/umamiConfig.ts
var umamiConfig = withUserConfig("umami", {
  /** 全局 Umami 统计总开关：false 时完全不加载 oddmisc 运行时脚本与 DOM */
  enable: false,
  /** Umami 分享链接（必填） */
  shareUrl: "",
  /** Umami Website ID；与 scriptUrl 同时填写时启用访问采集 */
  websiteId: "",
  /** Umami 采集脚本 URL；与 websiteId 同时填写时启用访问采集 */
  scriptUrl: ""
});
function resolveUmamiOptions(config) {
  if (!config.enable) {
    return null;
  }
  const shareUrl = config.shareUrl?.trim();
  if (!shareUrl) {
    return null;
  }
  return {
    shareUrl,
    websiteId: config.websiteId?.trim() || void 0,
    scriptUrl: config.scriptUrl?.trim() || void 0
  };
}
export {
  resolveUmamiOptions,
  umamiConfig
};
