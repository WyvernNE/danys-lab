# Dany's Lab

Mon laboratoire personnel : portfolio, blog et carnet de recettes café.

🌐 **En ligne :** <https://wyvernne.github.io/danys-lab/>

## Commandes

```bash
pnpm install   # installer les dépendances (une seule fois)
pnpm dev       # serveur local sur http://localhost:4321/danys-lab/
pnpm build     # génère le site statique dans dist/
pnpm preview   # prévisualise le build
```

Chaque push sur `main` publie automatiquement le site sur GitHub Pages
(`.github/workflows/deploy.yml`).

## Où modifier quoi

| Dossier | Contenu |
| --- | --- |
| `shirones/config/` | réglages du site : titre, couleur, menu (`navBarConfig.ts`), barre latérale, profil… |
| `shirones/config/i18nConfig.ts` | traduction française de l'interface |
| `shirones/config/data/` | données des pages : projets, compétences, timeline… |
| `shirones/content/posts/` | articles du blog et recettes (Markdown) |
| `shirones/content/series/` | séries d'articles (ex. `labo-cafe.md`) |
| `shirones/content/spec/about.md` | page « À propos » |
| `public/` | images, logo, favicons, bannière |
| `src/components/`, `src/layouts/` | remplacer un composant du thème (même chemin que dans le thème) |

Les articles de démonstration du thème restent consultables dans
`node_modules/shirones/template/` après un `pnpm install`.

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
