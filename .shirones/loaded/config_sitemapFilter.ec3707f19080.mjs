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

// shirones/config/aboutConfig.ts
var aboutConfig = withUserConfig("about", {
  enable: true,
  title: "$t:about",
  description: "$t:about"
});

// shirones/config/albumsConfig.ts
var albumsConfig = withUserConfig("albums", {
  enable: true,
  title: "$t:albums",
  description: "$t:albumsBanner"
});

// shirones/config/animeConfig.ts
var animeConfig = withUserConfig("anime", {
  /** 是否启用番剧页；false 时导航入口同步隐藏，访问 /anime/ 跳转 404 */
  enable: true,
  title: "$t:anime",
  description: "$t:animeBanner",
  /** 主数据源选择 */
  source: {
    kind: "local"
    // provider: "bangumi",
    // file: "bangumi.json",
    // fetchOnDev: true,
  },
  /** 异常降级策略（快照丢失或解析失败时回退本地数据） */
  fallback: {
    kind: "local"
  },
  /** 外部提供方配置 */
  providers: {
    bangumi: {
      enable: false,
      userId: "",
      // 填入你的 Bangumi 数字 UID 或公开用户名（测试可填 "sai"）
      request: {
        pageSize: 50,
        maxItems: 300,
        minDelayMs: 200
      }
    },
    bilibili: {
      enable: false,
      vmid: "",
      // 填入你的 B 站公开 UID
      sessdataEnv: "BILI_SESSDATA",
      cover: {
        mode: "local",
        // "local" 站内下载缓存（推荐）| "remote" 远程链接 | "none"
        useWebp: true
      },
      request: {
        pageSize: 30,
        maxItems: 300,
        minDelayMs: 300
      }
    }
  },
  /** 快照存储管理 */
  snapshot: {
    directory: "shirones/config/data/anime-snapshots",
    staleAfterDays: 30,
    keepLastValid: true
  }
});
var SAFE_FILENAME_PATTERN = /^[a-zA-Z0-9_-]+\.json$/;
function resolveAnimeOptions(config) {
  const enable = Boolean(config.enable);
  const fallback = config.fallback?.kind === "empty" ? "empty" : "local";
  const directory = typeof config.snapshot?.directory === "string" && config.snapshot.directory.trim() && !config.snapshot.directory.includes("..") ? config.snapshot.directory.trim().replace(/[\\/]+$/, "") : "shirones/config/data/anime-snapshots";
  const staleAfterDays = typeof config.snapshot?.staleAfterDays === "number" && Number.isFinite(config.snapshot.staleAfterDays) && config.snapshot.staleAfterDays > 0 ? Math.floor(config.snapshot.staleAfterDays) : 30;
  const keepLastValid = config.snapshot?.keepLastValid ?? true;
  const rawKind = config.source?.kind;
  let kind = "local";
  let provider;
  let file;
  if (rawKind === "snapshot") {
    const rawProvider = config.source?.provider;
    if (rawProvider === "bangumi" || rawProvider === "bilibili") {
      provider = rawProvider;
    }
    const rawFile = config.source?.file?.trim();
    if (rawFile && SAFE_FILENAME_PATTERN.test(rawFile) && // 若指定了 provider 但 file 误填了另一 provider 的 json，自动校正为对应 provider 的 json 文件
    !(provider === "bilibili" && rawFile === "bangumi.json") && !(provider === "bangumi" && rawFile === "bilibili.json")) {
      file = rawFile;
    } else if (provider) {
      file = `${provider}.json`;
    }
    const fetchOnDev = config.source?.fetchOnDev ?? true;
    if (file) {
      kind = "snapshot";
    }
    return Object.freeze({
      enable,
      source: Object.freeze({
        kind,
        ...provider ? { provider } : {},
        ...file ? { file } : {},
        fetchOnDev
      }),
      fallback,
      snapshot: Object.freeze({
        directory,
        staleAfterDays,
        keepLastValid
      })
    });
  }
  return Object.freeze({
    enable,
    source: Object.freeze({
      kind,
      ...provider ? { provider } : {},
      ...file ? { file } : {},
      fetchOnDev: config.source?.fetchOnDev ?? true
    }),
    fallback,
    snapshot: Object.freeze({
      directory,
      staleAfterDays,
      keepLastValid
    })
  });
}
var resolvedAnimeOptions = resolveAnimeOptions(animeConfig);

// shirones/config/compassConfig.ts
var compassConfig = withUserConfig("compass", {
  enable: true,
  title: "$t:compass",
  description: "$t:compassBanner"
});

// shirones/config/devicesConfig.ts
var devicesConfig = withUserConfig("devices", {
  enable: true,
  title: "$t:devices",
  description: "$t:devicesBanner",
  categories: [
    {
      key: "desk",
      label: "Desk Setup",
      icon: "material-symbols:desktop-windows-outline-rounded",
      description: "Workstation & home office hardware"
    },
    {
      key: "mobile",
      label: "Mobile & EDC",
      icon: "material-symbols:phone-iphone",
      description: "Daily portable devices & smart gadgets"
    },
    {
      key: "audio",
      label: "Audio & Visual",
      icon: "material-symbols:headphones-rounded",
      description: "Headphones, speakers & monitoring gears"
    },
    {
      key: "peripheral",
      label: "Peripherals",
      icon: "material-symbols:keyboard-outline-rounded",
      description: "Keyboards, mice & desk accessories"
    }
  ]
  // disabledIds: [],
});

// shirones/config/friendsConfig.ts
var friendsConfig = withUserConfig("friends", {
  enable: true,
  title: "$t:friends",
  description: "$t:friendsBanner"
});

// shirones/config/gamesConfig.ts
var gamesConfig = withUserConfig("games", {
  enable: true,
  title: "$t:games",
  description: "$t:gamesBanner",
  categories: [
    {
      key: "open-world",
      label: "Open World",
      icon: "material-symbols:explore-outline-rounded",
      description: "Open-world adventures"
    },
    {
      key: "sandbox",
      label: "Sandbox",
      icon: "material-symbols:widgets-rounded",
      description: "Building, crafting & creative worlds"
    },
    {
      key: "rpg",
      label: "RPG",
      icon: "material-symbols:shield-outline-rounded",
      description: "Role-playing stories & builds"
    },
    {
      key: "action",
      label: "Action",
      icon: "material-symbols:swords-outline-rounded",
      description: "Action, fighting & shooters"
    },
    {
      key: "casual",
      label: "Casual",
      icon: "material-symbols:extension-outline-rounded",
      description: "Cozy, casual & party games"
    }
  ]
  // disabledIds: [],
});

// shirones/config/momentsConfig.ts
var momentsConfig = withUserConfig("moments", {
  enable: true,
  title: "$t:moments",
  description: "$t:momentsBanner"
});

// shirones/config/projectsConfig.ts
var projectsConfig = withUserConfig("projects", {
  enable: true,
  title: "$t:projects",
  description: "$t:projectsBanner",
  categories: [
    {
      key: "theme",
      label: "Theme",
      icon: "material-symbols:palette-outline-rounded"
    },
    {
      key: "android",
      label: "Android",
      icon: "material-symbols:android-rounded"
    }
  ]
  // disabledKeys: [],
});

// shirones/config/seriesConfig.ts
var seriesConfig = withUserConfig("series", {
  enable: true,
  title: "$t:series",
  // 空 = 使用动态汇总（「x 个系列 · y 篇文章」）
  description: "",
  cardPosition: "bottom"
});

// shirones/config/skillsConfig.ts
var skillsConfig = withUserConfig("skills", {
  enable: true,
  title: "$t:skills",
  description: "$t:skillsBanner",
  categories: [
    {
      key: "frontend",
      label: "Frontend",
      icon: "material-symbols:web-rounded"
    },
    {
      key: "backend",
      label: "Backend",
      icon: "material-symbols:dns-rounded"
    },
    {
      key: "tooling",
      label: "Tooling",
      icon: "material-symbols:construction-rounded"
    }
  ]
  // disabledNames: [],
});

// shirones/config/timelineConfig.ts
var timelineConfig = withUserConfig("timeline", {
  enable: true,
  title: "$t:timeline",
  description: "$t:timelineBanner",
  categories: [
    {
      key: "milestone",
      label: "Milestones",
      icon: "material-symbols:flag-rounded"
    },
    {
      key: "project",
      label: "Projects",
      icon: "material-symbols:code-rounded"
    },
    {
      key: "career",
      label: "Career",
      icon: "material-symbols:work-rounded"
    },
    {
      key: "education",
      label: "Education",
      icon: "material-symbols:school-rounded"
    },
    {
      key: "life",
      label: "Life",
      icon: "material-symbols:favorite-rounded"
    }
  ],
  order: "desc"
  // disabledTitles: [],
});

// shirones/config/sitemapFilter.ts
function getDisabledPages() {
  const disabled = [];
  if (skillsConfig.enable === false) disabled.push("skills");
  if (projectsConfig.enable === false) disabled.push("projects");
  if (timelineConfig.enable === false) disabled.push("timeline");
  if (devicesConfig.enable === false) disabled.push("devices");
  if (gamesConfig.enable === false) disabled.push("games");
  if (animeConfig.enable === false) disabled.push("anime");
  if (aboutConfig.enable === false) disabled.push("about");
  if (friendsConfig.enable === false) disabled.push("friends");
  if (momentsConfig.enable === false) disabled.push("moments");
  if (albumsConfig.enable === false) disabled.push("albums");
  if (compassConfig.enable === false) disabled.push("compass");
  if (seriesConfig.enable === false) disabled.push("series");
  return disabled;
}
function isSitemapPageAllowed(pageUrl) {
  const disabled = getDisabledPages();
  for (const p of disabled) {
    if (pageUrl.endsWith(`/${p}/`) || pageUrl.endsWith(`/${p}`) || pageUrl.includes(`/${p}/`)) {
      return false;
    }
  }
  return true;
}
export {
  getDisabledPages,
  isSitemapPageAllowed
};
