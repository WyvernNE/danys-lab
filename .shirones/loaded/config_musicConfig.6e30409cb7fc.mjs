import { createRequire as __shironesCreateRequire } from 'node:module';
const require = __shironesCreateRequire(import.meta.url);

// shirones/config/data/music.ts
var musicTracks = [
  {
    id: "dazbee",
    title: "\u53E3\u7B1B\u3067\u611B\u306F\u6B4C\u3048\u306A\u3044",
    artist: "Dazbee",
    cover: "assets/images/music/dazbee.webp",
    source: "/assets/music/url/dazbee.mp3",
    duration: 241
  },
  {
    id: "hitori",
    title: "\u3072\u3068\u308A\u4E0A\u624B",
    artist: "Kaya",
    cover: "assets/images/music/hitori.webp",
    source: "/assets/music/url/hitori.mp3",
    duration: 253
  },
  {
    id: "xryx",
    title: "\u7729\u8000\u591C\u884C",
    artist: "\u30B9\u30EA\u30FC\u30BA\u30D6\u30FC\u30B1",
    cover: "assets/images/music/xryx.webp",
    source: "/assets/music/url/xryx.mp3",
    duration: 245
  },
  {
    id: "cl",
    title: "\u6625\u96F7\u306E\u9803",
    artist: "22/7",
    cover: "assets/images/music/cl.webp",
    source: "/assets/music/url/cl.mp3",
    duration: 242
  }
];

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

// shirones/config/musicConfig.ts
var musicConfig = withUserConfig("music", {
  enable: true,
  provider: "mixed",
  // tracks: [
  // 	{
  // 		id: "custom-1",
  // 		title: "示例曲目",
  // 		artist: "艺术家",
  // 		cover: "/assets/music/cover/example.webp",
  // 		source: "/assets/music/url/example.mp3",
  // 		duration: 240,
  // 	},
  // ],
  meting: {
    server: "netease",
    type: "playlist",
    id: "14164869977",
    // 进入视口时预取歌单元数据（仅元信息，不预取音频流）：
    // "metadata"（取）| "none"（默认，不取；交互后才请求，卡片显示「尚未请求」占位）
    preload: "none"
  },
  defaultVolume: 0.7,
  defaultMode: "sequence"
});
var ABSOLUTE_MEDIA_SOURCE = /^(?:https?:)?\/\//i;
var UNSAFE_SCHEME = /^[a-z][a-z\d+.-]*:/i;
function normalizeMediaSource(value) {
  const source = value.trim();
  if (!source) return null;
  if (ABSOLUTE_MEDIA_SOURCE.test(source) || source.startsWith("/")) {
    return source;
  }
  if (UNSAFE_SCHEME.test(source)) return null;
  return `/${source.replace(/^\.\//, "")}`;
}
function normalizeTrack(track, usedIds) {
  const id = track.id.trim();
  const title = track.title.trim();
  const source = normalizeMediaSource(track.source);
  if (!id || !title || !source || usedIds.has(id)) return null;
  usedIds.add(id);
  const artist = track.artist?.trim() || void 0;
  const cover = track.cover ? normalizeMediaSource(track.cover) ?? void 0 : void 0;
  const duration = typeof track.duration === "number" && Number.isFinite(track.duration) && track.duration > 0 ? track.duration : void 0;
  return Object.freeze({ id, title, source, artist, cover, duration });
}
function clampMusicVolume(value, fallback = 0.7) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(1, Math.max(0, value));
}
function resolveMetingConfig(meting) {
  if (!meting) return meting;
  return Object.freeze({ ...meting, preload: meting.preload ?? "none" });
}
function resolveMusicOptions(config) {
  if (!config.enable) return null;
  const provider = config.provider ?? "local";
  if (provider === "meting") {
    const id = config.meting?.id?.trim();
    if (!id) return null;
    return Object.freeze({
      provider: "meting",
      playlist: Object.freeze([]),
      meting: resolveMetingConfig(config.meting),
      defaultVolume: clampMusicVolume(config.defaultVolume),
      defaultMode: config.defaultMode
    });
  }
  let rawTracks = [];
  if (provider === "local" || provider === "mixed") {
    rawTracks = config.tracks ?? musicTracks;
  } else if (provider === "custom") {
    rawTracks = config.tracks ?? [];
  }
  const usedIds = /* @__PURE__ */ new Set();
  const playlist = rawTracks.map((track) => normalizeTrack(track, usedIds)).filter((track) => track !== null);
  if (provider === "mixed") {
    const metingId = config.meting?.id?.trim();
    if (playlist.length === 0 && !metingId) return null;
    return Object.freeze({
      provider: "mixed",
      playlist: Object.freeze(playlist),
      meting: resolveMetingConfig(config.meting),
      defaultVolume: clampMusicVolume(config.defaultVolume),
      defaultMode: config.defaultMode
    });
  }
  if (playlist.length === 0) return null;
  return Object.freeze({
    provider,
    playlist: Object.freeze(playlist),
    defaultVolume: clampMusicVolume(config.defaultVolume),
    defaultMode: config.defaultMode
  });
}
export {
  clampMusicVolume,
  musicConfig,
  resolveMusicOptions
};
