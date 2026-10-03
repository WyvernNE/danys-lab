# Dany's Lab

Mon laboratoire personnel : portfolio, blog et carnet de recettes café.

🌐 **En ligne :** <https://wyvernne.github.io/danys-lab/>

## Commandes

```bash
pnpm install   # installer les dépendances (une seule fois)
pnpm dev       # serveur local (français) : http://localhost:4321/danys-lab/
pnpm dev:en    # serveur local en anglais : http://localhost:4321/danys-lab/en/
pnpm build     # construit toutes les langues dans dist/
pnpm preview   # sert dist/ (toutes les langues, sélecteur compris)
pnpm translate # traduit avec Claude ce qui a changé (voir « Langues »)
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
| `shirones/recipes/fr/*.cook` | **recettes en Cooklang** (+ image du même nom, ex. `espresso.webp`) |
| `shirones/content/fr/posts/` | articles du blog (Markdown) |
| `shirones/content/fr/series/` | séries d'articles (ex. `labo-cafe.md`) |
| `shirones/content/fr/spec/about.md` | page « À propos » |
| `shirones/i18n/` | langues du site, textes traduits (`messages/`), suivi des traductions |
| `shirones/content/<langue>/`, `shirones/recipes/<langue>/` | traductions (générées par l'IA, relues par toi) |
| `public/` | logo, favicons, image de partage (`images/og.jpg`), couvertures de projets (`images/projects/`) |
| `shirones/assets/` | avatar et bannière (optimisés automatiquement) |
| `shirones/content/fr/posts/<article>/cover.webp` | couverture d'un article (champ `image: ./cover.webp`) |
| `scripts/generate-images.mjs` | dessine toutes ces illustrations ; modifie-le puis lance `pnpm images` |
| `src/components/`, `src/layouts/` | remplacer un composant du thème (même chemin que dans le thème) |

Les articles de démonstration du thème restent consultables dans
`node_modules/shirones/template/` après un `pnpm install`.

## Écrire une recette (Cooklang)

Crée `shirones/recipes/fr/ma-recette.cook` :

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
`shirones/content/<langue>/posts/recettes/` (dossier généré, ignoré par Git : on ne le
modifie pas à la main). Le convertisseur est dans `integrations/cooklang.mjs`.

## Langues

Le site existe en **français** (à la racine) et en **anglais** (`/danys-lab/en/`), avec un
sélecteur de langue dans le menu. Tu n'écris qu'en français : le reste est traduit par
l'IA et attend ta validation.

```
tu écris en FR sur dev ─▶ GitHub traduit avec Claude ─▶ PR « Traductions IA à valider » (→ dev)
                                                         │ tu relis / corriges, puis fusionnes
                                                         ▼
                                     dev ─▶ PR dev → main ─▶ site en ligne
```

- **Ce qui est traduit** : articles, séries, page À propos (`shirones/content/fr/`),
  recettes (`shirones/recipes/fr/`) et textes du site (`shirones/i18n/messages/fr.json` :
  sous-titre, bio, menu, projets…). Seul ce qui a changé est retraduit
  (`shirones/i18n/translations.lock.json`).
- **Contrôles automatiques** : quantités et minuteurs des recettes identiques, champs
  techniques (dates, images, séries) inchangés, structure Markdown/JSON préservée,
  et le site doit se construire. Une traduction qui échoue est signalée dans la PR.
- **Valider** = fusionner la PR de traductions (tu peux corriger avant, dans la PR ou dans
  Pages CMS sur la branche `i18n/traductions`). **Refuser** = fermer la PR et supprimer la branche.
- **Mise en route (une fois)** : ajoute le secret `ANTHROPIC_API_KEY` (Settings → Secrets and
  variables → Actions) et coche *Allow GitHub Actions to create and approve pull requests*
  (Settings → Actions → General).
- **En local** : `ANTHROPIC_API_KEY=… pnpm translate` (ou `--dry-run` pour voir ce qui serait traduit).
  Si tu traduis toi-même un texte français modifié : `pnpm translate --accept`
  (sinon l'IA le retraduira).

### Ajouter une langue

1. Ajoute-la dans `shirones/i18n/locales.mjs` (code, nom, drapeau, langue du thème).
2. Ajoute sa ligne d'import dans `shirones/i18n/messages.mjs`.
3. Pousse sur `dev` : l'IA traduit tout le site dans une PR à valider.

Si le thème ne connaît pas la langue (l'allemand par exemple), l'IA traduit aussi ses
boutons et libellés.

## Éditer depuis le navigateur (Pages CMS)

1. Va sur <https://app.pagescms.org> et connecte-toi avec GitHub.
2. Autorise l'accès au dépôt `danys-lab`.
3. Les sections **Recettes**, **Articles** et **Page À propos** (en français) apparaissent,
   ainsi que **Recettes (EN)** et **Articles (EN)** pour relire les traductions
   (config : `.pages.yml`).

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

Les traductions sont faites par Claude (Anthropic). Les recettes sont analysées par le parser officiel
[Cooklang](https://cooklang.org) (`@cooklang/cooklang`, licence MIT).
