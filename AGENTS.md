# Instructions pour les agents — Dany's Lab

Site personnel de Dany (portfolio, blog, recettes de café en Cooklang), construit avec
Astro et le thème **Shirone** installé en paquet npm (`shirones`). Le code du thème vit
dans `node_modules/shirones` : on ne le modifie pas, on le configure.

## Branches et routine (à respecter)

- **Toujours travailler sur `dev`** (ou une branche partant de `dev`), jamais directement sur `main`.
- `main` = site en ligne : chaque push sur `main` déploie sur GitHub Pages.
- Pour publier : ouvrir une pull request **`dev` → `main`**. Dany la relit et la fusionne lui-même.
- Avant de pousser : `pnpm build` et `pnpm astro check` doivent passer (0 erreur).
  Le workflow `.github/workflows/check.yml` refait ces vérifications sur `dev` et sur les PR.
- Si `dev` est en retard sur `main` (par ex. après des commits faits depuis Pages CMS),
  fusionner `main` dans `dev` avant de commencer.
- Commits au format `type(portée): sujet` (`feat`, `fix`, `docs`, `chore`…), en français.

## Où se trouve quoi

- `shirones/config/` : configuration du thème (site, menu, profil, i18n française…).
- `shirones/recipes/*.cook` : recettes Cooklang (en-tête YAML + image du même nom).
  Converties en articles par `integrations/cooklang.mjs` dans
  `shirones/content/posts/recettes/` (généré, ignoré par Git, ne pas éditer).
- `shirones/content/` : articles Markdown, séries, page À propos.
- `scripts/generate-images.mjs` : génère logo, favicons, bannière, couvertures (`pnpm images`).
- `.pages.yml` : configuration de Pages CMS.
- `src/components/`, `src/layouts/` : surcharges de composants du thème (à éviter si une
  option de config suffit).

## Points d'attention

- Le site est servi sous `/danys-lab/` : les images doivent passer par des chemins relatifs
  (`shirones/assets/…`, `./cover.webp`) ou des chemins `public/` gérés par le thème ;
  tester avec `pnpm build && pnpm preview`.
- Le thème n'affiche côté navigateur que les icônes listées dans
  `node_modules/shirones/src/generated/local-icon-collections.ts`.
- Les pages désactivées dans `shirones/config/` doivent aussi figurer dans `excludeRoutes`
  (`astro.config.mjs`).
- `@cooklang/cooklang` est figé en 0.18.7 (la 0.19.0 publiée est incomplète).
- Unités des minuteurs Cooklang : `s`, `min`, `h`.
- Garder les crédits au thème Shirone (LyraVoid) et au paquet `shirones` (yCENzh).
