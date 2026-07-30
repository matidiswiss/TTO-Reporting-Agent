# TTO Reporting Agent

Transform TikTok One Excel exports into client-ready reporting decks and a live campaign dashboard.

## Preview

Open `/preview/index.html` locally or deploy to Vercel/GitHub Pages.

```bash
python3 -m http.server 3456
# http://localhost:3456/preview/index.html
```

## Structure

- `preview/` — Web dashboard (campaign KPIs, charts, insights)
- `exports/` — TikTok One Excel exports (source data)
- `output/` — Generated PowerPoint decks (local only)
- `references/` — Reference deck templates (local only)
