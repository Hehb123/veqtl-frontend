# veQTL-Atlas Frontend

Vue 3 frontend for browsing variance expression quantitative trait loci (veQTL), SNP-gene pair queries, tissue-level locus plots, SMR associations, and expression-by-genotype plots.

## Tech Stack

- Vue 3
- Vite
- Vue Router
- Element Plus
- ECharts / vue-echarts
- Axios

## Repository Layout

```txt
src/
  components/        Reusable plot and UI components
  views/             Page-level Vue views
  router/            Vue Router configuration
  api.js             Axios API client
  cache.js           Frontend in-memory cache helpers
  style.css          Global styles
public/              Static public assets
```

## Requirements

- Node.js
- npm
- Running veQTL-Atlas backend API

## Install

```bash
npm install
```

## Run Locally

Start the backend first, then run:

```bash
npm run dev
```

The dev server usually runs at:

```txt
http://localhost:5173
```

During local development, Vite proxies `/api` requests to:

```txt
http://localhost:8000
```

This proxy is configured in `vite.config.js`.

By default, the frontend calls the API at the same origin:

```txt
/api
```

This behavior is defined in:

```txt
src/api.js
```

You can override the backend URL with `VITE_API_BASE_URL`:

```bash
VITE_API_BASE_URL=http://localhost:8000/api npm run dev
```

On Windows PowerShell:

```powershell
$env:VITE_API_BASE_URL="http://localhost:8000/api"
npm run dev
```

## Build

```bash
npm run build
```

The production build is written to:

```txt
dist/
```

Preview the production build locally:

```bash
npm run preview
```

## Deployment Notes

Recommended production layout:

```txt
Nginx
  /       -> frontend dist/
  /api/   -> FastAPI backend on 127.0.0.1:8000
```

For same-domain deployment behind Nginx, consider setting:

```txt
VITE_API_BASE_URL=/api
```

This is already the default fallback in `src/api.js`.

## Main Pages

- `/` - tissue browser and module navigation
- `/query` - SNP-gene pair search and tissue presence heatmap
- `/tissue/:tissue` - tissue summary, veGenes, and locus plot
- `/trait/smr` - SMR association table and colocalization plot
- `/download` - downloadable summary data
- `/documentation` - user documentation

## Git Notes

The repository tracks frontend source code only. The following are intentionally ignored:

- `node_modules/`
- `dist/`
- local environment files
- editor and OS metadata

Common workflow:

```bash
git status
git add .
git commit -m "Describe the change"
git push
```
