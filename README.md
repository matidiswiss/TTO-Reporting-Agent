# TTO Reporting Agent

Transform TikTok One Excel exports into client-ready reporting decks and a live campaign dashboard.

## Quick start — generate a campaign report

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

python scripts/generate_report.py \
  --input "exports/TIKTOK ONE REPORT - Betadine Antiseptic Solution (OLV - Online Video).xlsx" \
  --format both \
  --period "Jun 2026" \
  --brand "Betadine Wound (Solution, Ointment, Bening)"
```

Or use the wrapper (same defaults as the sample campaign):

```bash
chmod +x scripts/generate_report.sh
./scripts/generate_report.sh
```

**Outputs**

| Output | Path |
|--------|------|
| Dashboard data | `preview/data.json` |
| Solution deck (~7 slides) | `output/FOLO - Report TTO Betadine Antiseptic Solution (Jun 2026).pptx` |
| Wound deck (16 slides) | `output/FOLO - Report TTO Betadine Wound (Jun 2026).pptx` |

The script reads **Campaign Report**, **Campaign History Report**, and **Video Report** sheets from the TikTok One export. Campaign-level totals are used for KPIs; video vs campaign view gaps are printed as QA notes.

**CLI flags**

- `--format solution|wound|both` — deck format (default: `both`)
- `--json-only` / `--pptx-only` — skip deck or JSON generation
- `--template` — reference `.pptx` (default: `references/FOLO - Report TTO Wound (Mar-Apr).pptx`)
- `--json-out`, `--output-dir` — override output paths

`references/` and `output/` are gitignored — keep templates and generated decks locally.

## Upload deliverables

After regenerating decks, refresh hosted download URLs:

```bash
chmod +x scripts/upload-deliverables.sh
./scripts/upload-deliverables.sh
```

Requires `.env` with `SUPABASE_SECRET_KEY` and `GITHUB_TOKEN` (see `.env.example`).

## Preview dashboard

```bash
python3 -m http.server 3456
# Login: http://localhost:3456/preview/login.html
# Dashboard: http://localhost:3456/preview/index.html
```

Production: https://tto-ra.vercel.app

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

## Structure

- `preview/` — Web dashboard (campaign KPIs, charts, insights)
- `exports/` — TikTok One Excel exports (source data)
- `output/` — Generated PowerPoint decks (local only)
- `references/` — Reference deck templates (local only)
- `scripts/generate_report.py` — Excel → `data.json` + `.pptx` pipeline

See **[ROADMAP.md](./ROADMAP.md)** for phased plan, status, and handoff notes for new agents.
