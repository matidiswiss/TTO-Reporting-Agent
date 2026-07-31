# TTO Reporting Agent

Transform TikTok One Excel exports into client-ready reporting decks and a live campaign dashboard.

## Preview

```bash
python3 -m http.server 3456
# Login: http://localhost:3456/preview/login.html
# Dashboard: http://localhost:3456/preview/index.html
```

Default credentials are stored in Supabase (`tto_app_users`).

## Supabase

- Project: [NAISU_COMM](https://supabase.com/dashboard/project/atnrdggjbfaosjqafkor)
- Auth via RPC `tto_login(username, password)`
- Deliverables bucket: `tto-deliverables` (Solution deck; Wound deck on GitHub Release)
- Client config: `preview/js/supabase-config.js`
- Migrations: `supabase/migrations/`

Copy `.env.example` to `.env` and fill Supabase keys for local/server use.

## Deliverables hosting

PowerPoint decks are too large for git. Download links in the dashboard point to:

- **Wound deck (166MB)** — GitHub Release `deliverables-jun-2026`
- **Solution deck (45MB)** — Supabase Storage `tto-deliverables`
- **Source Excel** — `exports/` in repo (served via Vercel)

Re-upload after regenerating decks:

```bash
chmod +x scripts/upload-deliverables.sh
./scripts/upload-deliverables.sh
```

## Structure

- `preview/` — Web dashboard (campaign KPIs, charts, insights)
- `exports/` — TikTok One Excel exports (source data)
- `output/` — Generated PowerPoint decks (local only)
- `references/` — Reference deck templates (local only)
