# Terracotta Studio — interactive pottery storefront

A React + Vite concept storefront with a 3D shader pottery hero, custom cursor, scratch-to-reveal intro, GSAP scroll reveals, Lenis smooth scrolling, product cards, process storytelling, and postprocessing.

## Run it

1. Open this folder in VS Code.
2. Open Terminal → New Terminal.
3. Install Node.js 20+ if it is not already installed.
4. Run:

```bash
npm install
npm run dev
```

5. Open the local URL Vite prints (usually `http://localhost:5173`).

For a production build:

```bash
npm run build
npm run preview
```

## What's included

- React + Vite app
- Three.js through React Three Fiber
- Procedural pottery lathe mesh with custom GLSL vertex/fragment shaders
- React Three Drei helpers, floating animation and contact shadows
- Bloom + vignette postprocessing
- GSAP + ScrollTrigger reveal animations
- Lenis smooth scrolling
- Custom pointer cursor and hover state
- HTML Canvas scratch-to-reveal intro (mouse + touch)
- Responsive shop, story, process, journal, newsletter, and footer sections
- Add-to-bag counter prototype

## Before publishing

- Product photography currently uses remote Unsplash images; replace with your own product photos for a real shop.
- The cart and newsletter are front-end demos. Connect a checkout/payment provider and email service before accepting orders.
- Product prices and copy are sample content.
- The 3D vase is generated procedurally with GLSL and is intentionally stylized.
- If your computer struggles with 3D, reduce Canvas `dpr` in `src/App.jsx` from `[1, 1.7]` to `[1, 1.2]`.
