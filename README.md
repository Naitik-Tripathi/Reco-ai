# RECO AI — GitHub Pages Edition

This folder is a **frontend-only static edition** of RECO AI, prepared for GitHub Pages. It does not require Python, FastAPI, a `.env` file, an API key, or a backend server.

## What works in this edition

- **Home and information pages** — static React website pages.
- **Overview and Environment** — fetches modelled air-quality data directly from the public Open-Meteo Air Quality API. Values are grid-model data, not readings from the RECO helmet.
- **Clean Route Finder** — uses public OpenStreetMap Nominatim geocoding, OSRM demo routing and Open-Meteo route-point samples. Public services may rate-limit or be temporarily unavailable. Attribution and service usage policies apply.
- **Your RECO** — scroll-controlled Three.js helmet concept with the fan, air filter, battery and grill reveal.
- **My RECO device** — simulated fan control and sample telemetry stored in the visitor's browser. It does not control physical hardware.
- **Report Issue** — saves reports and optional compressed photos in the current browser's local storage. Reports are not uploaded to a shared server and are not visible to other visitors.
- **AI Assistant** — a small built-in, rule-based demo helper. It is **not an LLM** and does not use ChatGPT or another external AI model.

## Publish on GitHub Pages

1. Create a GitHub repository.
2. Upload the **contents of this folder** to the repository root (so `package.json`, `index.html`, `src/` and `.github/` are at the top level).
3. Push the files to the `main` branch.
4. In GitHub, open **Settings → Pages**. Under **Build and deployment → Source**, choose **GitHub Actions**.
5. Open the repository's **Actions** tab. Wait for **Deploy RECO AI to GitHub Pages** to finish successfully.
6. Open the public URL shown in **Settings → Pages**. It will usually look like `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`.

The included workflow builds the Vite app and deploys its `dist/` folder automatically on each push to `main`. Hash-based routing is enabled, so internal pages work from a GitHub Pages project URL without special server rewrites.

## Preview on your laptop (optional)

Install Node.js 22 or newer, open this folder in a terminal, then run:

```bash
npm install
npm run dev
```

For a production build:

```bash
npm run build
npm run preview
```

## Important limitations

This is a public demonstration frontend, not the full RECO AI backend. Browser-stored reports and device values belong only to the visitor's own browser. There is no shared report database, authentication, real device telemetry, physical helmet control, or LLM connection. Never add secret API keys to this repository. To add shared users, secure AI, device control and central reports later, connect the frontend to a separately hosted backend.

Air-quality data is supplied by Open-Meteo. Map tiles and geocoding/routing may use OpenStreetMap contributors, Nominatim and the OSRM public demo service. These third-party services have their own availability and usage policies.
