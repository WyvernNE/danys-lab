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

// node_modules/.pnpm/shirones@0.1.5_e99f9125c288bdf9f0113d8653260a09/node_modules/shirones/src/utils/font-options.ts
var ROLE_VARIABLES = {
  body: "--font-body",
  cjk: "--font-cjk",
  mono: "--font-mono"
};
var SYSTEM_FALLBACKS = {
  body: "ui-sans-serif, system-ui, sans-serif",
  cjk: "system-ui, sans-serif",
  mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
};
var LOCAL_FONT_PATH = /^src\/assets\/fonts\/(?!\.)(?!.*\.\.)[^?#[\]]+\.(?:woff2?|ttf|otf)$/i;
var FONTSOURCE_IMPORT = /^@fontsource(?:-variable)?\/[a-z0-9@._/-]+(?:\.css)?$/i;
var FAMILY_NAME = /^[\w][\w .'-]*$/u;
var IDENTIFIER = /^[a-z][a-z0-9-]*$/u;
var SUBSET_NAME = /^[a-z][a-z0-9-]*$/u;
var UNICODE_RANGE = /^(?:U\+[0-9A-F?]+(?:-[0-9A-F]+)?)(?:\s*,\s*U\+[0-9A-F?]+(?:-[0-9A-F]+)?)*$/iu;
function fail(path, message) {
  throw new Error(`Invalid font configuration at ${path}: ${message}`);
}
function assertFinitePositive(value, path) {
  if (!Number.isFinite(value) || value <= 0) {
    fail(path, "must be a positive finite number");
  }
}
function validateWeight(weight, path) {
  if (typeof weight === "number") {
    if (!Number.isInteger(weight) || weight < 1 || weight > 1e3) {
      fail(path, "must be an integer between 1 and 1000");
    }
    return;
  }
  const parts = weight.split(" ");
  if (parts.length !== 2 || parts.some((part) => !/^\d+$/.test(part)) || Number(parts[0]) < 1 || Number(parts[1]) > 1e3 || Number(parts[0]) > Number(parts[1])) {
    fail(
      path,
      "must be a single weight or an ascending range between 1 and 1000"
    );
  }
}
function validateVariant(variant, definition, index) {
  const path = `fontFamilies[${index}].variants`;
  if (typeof variant.file !== "string" || variant.file.length === 0) {
    fail(`${path}.file`, "must be a non-empty path");
  }
  if (definition.source === "local" && !LOCAL_FONT_PATH.test(variant.file)) {
    fail(
      `${path}.file`,
      "local fonts must be font files under src/assets/fonts (.woff2, .woff, .ttf, .otf)"
    );
  }
  if (definition.source === "fontsource" && !FONTSOURCE_IMPORT.test(variant.file)) {
    fail(`${path}.file`, "must be an audited @fontsource import specifier");
  }
  validateWeight(variant.weight, `${path}[${index}].weight`);
  if (variant.style !== "normal" && variant.style !== "italic") {
    fail(`${path}[${index}].style`, "must be normal or italic");
  }
  if (variant.subset !== void 0 && !SUBSET_NAME.test(variant.subset)) {
    fail(
      `${path}[${index}].subset`,
      "must contain lowercase letters, numbers, and hyphens"
    );
  }
  if (variant.unicodeRange !== void 0 && !UNICODE_RANGE.test(variant.unicodeRange)) {
    fail(
      `${path}[${index}].unicodeRange`,
      "must be a valid comma-separated Unicode range"
    );
  }
}
function validateFamily(definition, index) {
  const path = `fontFamilies[${index}]`;
  if (!IDENTIFIER.test(definition.id))
    fail(`${path}.id`, "must be a stable kebab-case identifier");
  if (!FAMILY_NAME.test(definition.family))
    fail(`${path}.family`, "contains unsupported CSS family characters");
  if (!["body", "cjk", "mono"].includes(definition.role))
    fail(`${path}.role`, "must be body, cjk, or mono");
  if (!["local", "fontsource"].includes(definition.source))
    fail(`${path}.source`, "must be local or fontsource");
  if (definition.variants.length === 0)
    fail(`${path}.variants`, "must contain at least one variant");
  if (definition.fallback.length === 0 || definition.fallback.some((item) => !FAMILY_NAME.test(item))) {
    fail(`${path}.fallback`, "must contain at least one valid system family");
  }
  if (!["swap", "optional", "block"].includes(definition.display))
    fail(`${path}.display`, "must be swap, optional, or block");
  if (typeof definition.preload !== "boolean")
    fail(`${path}.preload`, "must be a boolean");
  if (definition.licenseFile?.includes("..")) {
    fail(`${path}.licenseFile`, "must not escape the repository");
  }
  definition.variants.forEach((variant, variantIndex) => {
    validateVariant(variant, definition, variantIndex);
  });
}
function emptyRole(role) {
  return {
    cssVariable: ROLE_VARIABLES[role],
    family: "",
    fallback: SYSTEM_FALLBACKS[role],
    variants: [],
    display: role === "cjk" ? "optional" : "swap",
    preload: false
  };
}
function resolveFontOptions(config) {
  if (config.mode !== "system" && config.mode !== "custom")
    fail("mode", "must be system or custom");
  if (!Array.isArray(config.fontFamilies))
    fail("fontFamilies", "must be an array");
  if (typeof config.subsetting.allowRemoteText !== "boolean") {
    fail("subsetting.allowRemoteText", "must be a boolean");
  }
  assertFinitePositive(config.budget.maxTotalBytes, "budget.maxTotalBytes");
  assertFinitePositive(config.budget.maxFamilyBytes, "budget.maxFamilyBytes");
  if (config.budget.maxFamilyBytes > config.budget.maxTotalBytes) {
    fail("budget.maxFamilyBytes", "cannot exceed budget.maxTotalBytes");
  }
  const roles = {
    body: emptyRole("body"),
    cjk: emptyRole("cjk"),
    mono: emptyRole("mono")
  };
  const seenRoles = /* @__PURE__ */ new Set();
  config.fontFamilies.forEach((definition, index) => {
    validateFamily(definition, index);
    if (seenRoles.has(definition.role))
      fail(
        `fontFamilies[${index}].role`,
        `role ${definition.role} is already defined`
      );
    seenRoles.add(definition.role);
    if (config.mode === "custom") {
      roles[definition.role] = {
        cssVariable: ROLE_VARIABLES[definition.role],
        family: definition.family,
        fallback: definition.fallback.join(", "),
        variants: definition.variants.map((variant) => ({
          ...variant,
          source: definition.source
        })),
        display: definition.display,
        preload: definition.preload
      };
    }
  });
  if (config.mode === "custom" && roles.body.family === "" && roles.body.variants.length === 0) {
    fail(
      "fontFamilies",
      "custom mode requires a body role or an explicit body baseline"
    );
  }
  return {
    schemaVersion: 1,
    mode: config.mode,
    roles,
    preloadRoles: Object.keys(roles).filter(
      (role) => roles[role].preload
    ),
    subsetting: { ...config.subsetting },
    budget: { ...config.budget }
  };
}

// shirones/config/fontConfig.ts
var fontConfig = withUserConfig("font", {
  /**
   * 构建模式：
   * - `"custom"`: 启用自定义字体（加载下方 fontFamilies 中配置的字体）
   * - `"system"`: 纯系统字体模式（不打包任何自定义字体文件，完全依赖访客设备）
   */
  mode: "custom",
  /**
   * 字体清单列表（按需配置 body、cjk、mono 角色）
   */
  fontFamilies: [
    // ---------------------------------------------------------------------
    // 1. 正文字体（现代几何圆润西文字体 Outfit，与 M3E 大圆角及悠哉圆体绝配）
    // ---------------------------------------------------------------------
    {
      id: "outfit-body",
      family: "Outfit",
      role: "body",
      source: "fontsource",
      variants: [
        {
          file: "@fontsource/outfit/400.css",
          weight: 400,
          style: "normal"
        },
        {
          file: "@fontsource/outfit/500.css",
          weight: 500,
          style: "normal"
        },
        {
          file: "@fontsource/outfit/700.css",
          weight: 700,
          style: "normal"
        }
      ],
      fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
      display: "swap",
      preload: false
    },
    // ---------------------------------------------------------------------
    // 2. 中文 / 日文 CJK 字体（悠哉圆体 Yozai Medium，全量简繁中日韩 100% 覆盖）
    // ---------------------------------------------------------------------
    {
      id: "yozai-cjk",
      family: "Yozai Medium",
      role: "cjk",
      source: "local",
      variants: [
        {
          file: "src/assets/fonts/Yozai-Medium.ttf",
          weight: 500,
          style: "normal"
        }
      ],
      fallback: ["system-ui", "sans-serif"],
      display: "swap",
      preload: false
    },
    // ---------------------------------------------------------------------
    // 3. 代码等宽字体（渲染代码块与终端文本，对应 CSS 变量 --font-mono）
    // ---------------------------------------------------------------------
    {
      id: "jetbrains-mono",
      family: "JetBrains Mono",
      role: "mono",
      source: "fontsource",
      variants: [
        {
          file: "@fontsource-variable/jetbrains-mono/index.css",
          weight: "100 800",
          style: "normal"
        },
        {
          file: "@fontsource-variable/jetbrains-mono/wght-italic.css",
          weight: "100 800",
          style: "italic"
        }
      ],
      fallback: [
        "ui-monospace",
        "SFMono-Regular",
        "Menlo",
        "Monaco",
        "Consolas",
        "monospace"
      ],
      display: "swap",
      preload: false
    }
  ],
  /**
   * 字体子集化配置（生产构建时自动从文章、i18n、配置及 Meting 歌曲中提取字符，生成极速精简版 .woff2）
   * - Dev 开发环境：自动加载完整原字体，任意输入新汉字实时可见，极速 HMR 零等待；
   * - Build 生产构建：自动执行子集裁剪，将几十兆大字体压缩为几百 KB 的专属子集，秒开加载。
   */
  subsetting: {
    enable: true,
    // 启用自动化子集裁剪
    includeContent: true,
    // 扫描 src/content/ 下所有文章
    includeI18n: true,
    // 扫描全部 10 种语言词典
    includeConfig: true,
    // 扫描站点配置与导航
    includeCommon: true,
    // 包含常用标点与基础字符
    allowRemoteText: true
    // 允许抓取 Meting 云端歌单曲目文本参与字形提取
  },
  /**
   * 字体打包体积预算限制（子集化后通常仅 300KB ~ 1MB）
   */
  budget: {
    maxTotalBytes: 6 * 1024 * 1024,
    // 全站引用自定义字体总大小上限：6MB
    maxFamilyBytes: 4 * 1024 * 1024
    // 单个字体族文件大小上限：4MB
  }
});
var resolvedFontOptions = resolveFontOptions(fontConfig);
var resolveFontOptions2 = resolveFontOptions;
export {
  fontConfig,
  resolveFontOptions2 as resolveFontOptions,
  resolvedFontOptions
};
