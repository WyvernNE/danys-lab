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
- `shirones/recipes/<code>/*.cook` : recettes Cooklang (en-tête YAML + image du même nom).
  Converties en articles par `integrations/cooklang.mjs` dans
  `shirones/content/<code>/posts/recettes/` (généré, ignoré par Git, ne pas éditer).
- `shirones/content/<code>/` : articles Markdown, séries, page À propos.
- `scripts/generate-images.mjs` : génère logo, favicons, bannière, couvertures (`pnpm images`).
- `.pages.yml` : configuration de Pages CMS.
- `src/components/`, `src/layouts/` : surcharges de composants du thème (à éviter si une
  option de config suffit).

## Le labo (surcouche Dany's Lab)

- Positionnement : « Un Neuchâtelois perdu à Berne » (EN : « A Romand lost in Bern »).
  Méthode : je teste, je note, j'ajuste. Signature : « Un peu moins perdu qu'hier. »
  Gamification : chaque expérience = +1 repère ; niveaux dans `shirones/labConfig.ts`.
- Règles de design « Cozy · Simple · Opti » (internes, pas un slogan). Charte minimaliste : pas d'effets décoratifs (machine à écrire, carrousel, vagues,
  textures, sélecteurs de couleurs) ; le côté « riche » est réservé aux données.
- 4 piliers = 4 catégories : Boire, Bouger, Berne, Bâtir (EN : Drink, Move, Bern,
  Build). Liste et icônes : `shirones/labConfig.ts` ; textes : `lab.pillars` des messages.
- Liens (Luma, Instagram, YouTube, email) : `shirones/labConfig.ts`. Vide = masqué.
- Champs d'en-tête ajoutés aux articles et recettes (`src/content.config.ts`) :
  `experience` (bloc « Expérience #… » + « Verdict » avec Indice confort et radar),
  `sponsor` (mention « Collaboration commerciale », obligatoire pour tout contenu
  sponsorisé), `conceptual` (badge « Projet conceptuel »).
- Rendu de ces blocs : surcharge `src/components/content/Markdown.astro` (retrouve
  l'article par son URL). Calculs : `src/lab/experiences.ts` ; graphiques SVG : `src/lab/charts.ts`.
- Pages ajoutées : `src/pages/dashboard.astro`, `events.astro`, `collab.astro`,
  `experiences.csv.ts`. Textes des pages Events et Collaborer :
  `shirones/content/<code>/spec/events.md` et `collab.md`.
- Modèle d'étude de cas (brouillon) : `shirones/content/<code>/posts/modele-etude-de-cas/`.
- Liens de menu personnalisés : toujours leur donner un `pageKey` unique, sinon le
  thème les souligne sur les pages sans identifiant (articles, pages du labo).

## Multilingue

- Langues : `shirones/i18n/locales.mjs` (français = source, à la racine ; autres langues sous
  `/danys-lab/<code>/`). Une construction Astro par langue (`PUBLIC_SITE_LOCALE`),
  assemblées par `scripts/site.mjs` dans `dist/`.
- Contenu par langue : `shirones/content/<code>/`, `shirones/recipes/<code>/`,
  `shirones/i18n/messages/<code>.json`. Ne jamais écrire de texte visible en dur dans
  `shirones/config/` : passer par `messages`.
- Les traductions sont générées par `scripts/translate.mjs` (Claude) via
  `.github/workflows/translate.yml`, puis validées par Dany dans une PR. Corriger une
  traduction à la main est libre ; si on traduit soi-même une source française modifiée,
  lancer `pnpm translate --accept` pour que la CI ne la retraduise pas.
- Les slugs (noms de fichiers) sont identiques dans toutes les langues : le sélecteur
  de langue s'appuie dessus.

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
