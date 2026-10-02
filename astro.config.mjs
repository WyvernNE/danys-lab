import { defineConfig } from "astro/config";
import shirones from "shirones";
import cooklang from "./integrations/cooklang.mjs";

// Site-level settings (site URL, base, title, theme colour, fonts, …) live in
// `shirones/config/` so they stay typed and version-controlled with your
// content. This file only wires the theme in.
export default defineConfig({
  integrations: [
    // Recettes Cooklang (shirones/recipes/*.cook) → articles du blog.
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
