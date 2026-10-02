# Dany's Lab

Mon laboratoire personnel : portfolio, blog et carnet de recettes café.

🌐 **En ligne :** <https://wyvernne.github.io/danys-lab/>

## Commandes

```bash
pnpm install   # installer les dépendances (une seule fois)
pnpm dev       # serveur local sur http://localhost:4321/danys-lab/
pnpm build     # génère le site statique dans dist/
pnpm preview   # prévisualise le build
pnpm images    # régénère les illustrations (scripts/generate-images.mjs)
pnpm recipes   # convertit les recettes Cooklang sans lancer le site
```

## Routine de travail

```
dev  ──(je teste)──>  pull request dev → main  ──(je fusionne)──>  main = site en ligne
```

1. Travailler sur `dev` : `git checkout dev && git pull`.
2. Vérifier en local : `pnpm dev` (rapide) ou `pnpm build && pnpm preview` (version finale).
3. `git push` : GitHub vérifie automatiquement le build (onglet **Actions**, workflow « Vérifier le site »).
4. Quand c'est prêt : ouvrir une pull request **dev → main** sur GitHub, relire, fusionner.
5. La fusion dans `main` publie le site (`.github/workflows/deploy.yml`).

Après une fusion, remettre `dev` à jour : `git checkout dev && git pull origin main && git push`.

## Où modifier quoi

| Dossier | Contenu |
| --- | --- |
| `shirones/config/` | réglages du site : titre, couleur, menu (`navBarConfig.ts`), barre latérale, profil… |
| `shirones/config/i18nConfig.ts` | traduction française de l'interface |
| `shirones/config/data/` | données des pages : projets, compétences, timeline… |
| `shirones/recipes/*.cook` | **recettes en Cooklang** (+ image du même nom, ex. `espresso.webp`) |
| `shirones/content/posts/` | articles du blog (Markdown) |
| `shirones/content/series/` | séries d'articles (ex. `labo-cafe.md`) |
| `shirones/content/spec/about.md` | page « À propos » |
| `public/` | logo, favicons, image de partage (`images/og.jpg`), couvertures de projets (`images/projects/`) |
| `shirones/assets/` | avatar et bannière (optimisés automatiquement) |
| `shirones/content/posts/<article>/cover.webp` | couverture d'un article (champ `image: ./cover.webp`) |
| `scripts/generate-images.mjs` | dessine toutes ces illustrations ; modifie-le puis lance `pnpm images` |
| `src/components/`, `src/layouts/` | remplacer un composant du thème (même chemin que dans le thème) |

Les articles de démonstration du thème restent consultables dans
`node_modules/shirones/template/` après un `pnpm install`.

## Écrire une recette (Cooklang)

Crée `shirones/recipes/ma-recette.cook` :

```cook
---
title: Cappuccino
published: 2026-10-05
description: Espresso et lait microbullé.
tags: [Café, Recette]
servings: 1
time: 5 min
difficulty: facile
seriesOrder: 3
---

> Une intro facultative (les lignes « > » sont des notes).

Extraire @café moulu{18%g} dans la #machine à espresso{} pendant ~{28%s}.

Mousser @lait{120%ml} jusqu'à 60 °C.
```

- `@ingrédient{quantité%unité}`, `#ustensile{}`, `~{durée%unité}` (unités de temps : `s`, `min`, `h`).
- `== Section ==` pour découper les étapes.
- Couverture : une image `ma-recette.webp` à côté du fichier, ou le champ `image`.
- Par défaut, la recette rejoint la catégorie et la série « Labo café ».

À chaque `pnpm dev` ou `pnpm build`, les recettes sont converties en articles dans
`shirones/content/posts/recettes/` (dossier généré, ignoré par Git : on ne le modifie
pas à la main). Le convertisseur est dans `integrations/cooklang.mjs`.

## Éditer depuis le navigateur (Pages CMS)

1. Va sur <https://app.pagescms.org> et connecte-toi avec GitHub.
2. Autorise l'accès au dépôt `danys-lab`.
3. Les sections **Recettes**, **Articles** et **Page À propos** apparaissent (config : `.pages.yml`).

Pages CMS permet de choisir la branche (sélecteur en haut de l'écran) : choisis **`dev`**
pour préparer du contenu sans le publier, puis publie-le avec la pull request dev → main.
Sur `main`, chaque enregistrement est publié directement.
Les images envoyées vont dans `shirones/assets/uploads/`.

## Mettre à jour le thème

```bash
pnpm update shirones
npx shirones init            # signale les écarts avec le modèle, ne modifie rien
```

## Crédits

Ce site utilise le thème **[Shirone](https://github.com/LyraVoid/Shirone)**, créé par
[LyraVoid](https://github.com/LyraVoid), via le paquet npm
[`shirones`](https://github.com/yCENzh/shirones) maintenu par
[yCENzh](https://github.com/yCENzh). Le thème est distribué sous licence MIT.
Merci à eux !

Les recettes sont analysées par le parser officiel
[Cooklang](https://cooklang.org) (`@cooklang/cooklang`, licence MIT).
