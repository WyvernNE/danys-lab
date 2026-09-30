# Portfolio & labo café

Portfolio professionnel et laboratoire de recettes de café, en site statique avec [Astro](https://docs.astro.build) et Tailwind CSS.

## Structure

```text
src/
├── content/
│   ├── portfolio/   # Markdown
│   ├── projects/    # Markdown
│   └── drinks/      # Recettes Cooklang (.cook)
├── content.config.ts  # Déclaration des collections et de leurs schémas
├── loaders/           # Loaders de contenu personnalisés (Cooklang)
├── pages/
└── styles/
```

## Commandes

Le projet s'installe et se lance depuis WSL (les binaires natifs sont ceux de Linux).

| Commande          | Action                                   |
| :---------------- | :--------------------------------------- |
| `npm install`     | Installe les dépendances                 |
| `npm run dev`     | Serveur de dev sur `localhost:4321`      |
| `npm run build`   | Build statique dans `./dist/`            |
| `npm run preview` | Sert le build localement                 |
| `npm run check`   | Vérification des types (`astro check`)   |
