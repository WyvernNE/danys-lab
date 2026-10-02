import { defineConfig } from "astro/config";
import shirones from "shirones";
import cooklang from "./integrations/cooklang.mjs";
import i18n from "./integrations/i18n.mjs";

// Site-level settings (site URL, base, title, theme colour, fonts, …) live in
// `shirones/config/` so they stay typed and version-controlled with your
// content. This file only wires the theme in.
// Une construction = une langue (variable PUBLIC_SITE_LOCALE, voir
// shirones/i18n/locales.mjs). `pnpm build` les construit toutes et les assemble
// dans dist/ (scripts/build.mjs).
export default defineConfig({
  outDir: process.env.ASTRO_OUT_DIR ?? "dist",
  integrations: [
    // Sélecteur de langue (même page dans l'autre langue).
    i18n(),
    // Recettes Cooklang (shirones/recipes/<langue>/*.cook) → articles du blog.
    cooklang(),
    shirones({
      // Pages du thème désactivées dans shirones/config/ : on ne les génère pas
      // du tout. Pour en réactiver une, passe son `enable` à true dans sa
      // config ET retire-la de cette liste.
      excludeRoutes: [
        "/anime",
        "/compass",
        "/albums",
        "/albums/[id]",
        "/friends",
        "/moments",
        "/devices",
        "/games",
        "/timeline",
        "/skills",
      ],
      // Override individual components by mirroring the theme's structure in
      // `src/components/`, or point at them explicitly:
      // components: { "atoms/blog/PostCard": "./src/components/PostCard.astro" },
    }),
  ],
});
