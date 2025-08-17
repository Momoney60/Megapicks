# Helmet Avatar Builder

A self-contained web app to create a custom side-view mini football helmet avatar and set a username. Export to PNG or copy raw SVG.

## Run locally

- Serve the `helmet-avatar` folder with any static server. Examples:

```bash
# Python 3
python3 -m http.server 8080 --directory ./helmet-avatar

# Or npx
npx serve ./helmet-avatar -l 8080 --yes
```

Open `http://localhost:8080`.

## Features

- Username with localStorage save/load
- Helmet shell color or gradient, outline, gloss
- Metallic flake effect with amount
- Stripes: single/double/triple with angle/width/spacing
- Decals: star, lightning, single letter, or image upload
- Numbers with font, color, outline, position, scale
- Facemask color and style, chinstrap color
- Visor on/off with tint and opacity
- Background: transparent, solid, gradient, circle badge
- Export PNG, copy SVG, randomize, reset, share JSON link