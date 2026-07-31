# TTO Reporting Agent — Roadmap

Transform TikTok One Excel exports into client-ready reporting decks and a live campaign dashboard — with FOLO-style storytelling (insights > raw numbers).

**Last updated:** Jul 2026 · **Latest commit (Phase 1):** `f8085e9`

---

## Vision (Original Workflow)

The agent follows an 8-step reporting workflow (see project history). Default deliverables per campaign run:

1. Audit summary (Excel sheets, data quality)
2. Key findings (creators, content, outliers)
3. Storyline (evidence-based narrative)
4. Slide outline (title, metrics, layout per slide)
5. Final PowerPoint (`.pptx`) matched to reference deck structure

**Reporting principles:** Insights > metrics · Story > tables · Executive readability · Never invent data.

**Reference formats:**

| Format | Slides | Reference |
|--------|--------|-----------|
| Single product / creator | ~6–7 | Solution-only section |
| Wound portfolio | 16 | Solution + Ointment + Bening sections |

**Local-only assets (not in git):**

- `references/` — FOLO reference `.pptx` templates
- `output/` — Generated decks (Wound ~166MB, Solution ~45MB)

---

## Current Score (Post–Phase 1)

| Area | Score | Notes |
|------|-------|-------|
| Overall product | **5/10** | Strong POC; not yet repeatable |
| Excel → PPT automation | 4/10 | Done once manually; no script in repo |
| Web dashboard | 5.5/10 | Static `data.json`; Phase 1 sync fixes |
| Auth + Vercel deploy | 7/10 | `tto_login`, canonical routes |
| Deliverables download | 7/10 | GitHub Release + Supabase Storage |
| Multi-campaign / upload UI | 2/10 | Not started |

**Target after Phase 2:** ~7.5/10 · **After Phase 3:** ~8.5/10

---

## Infrastructure Quick Reference

| Item | Value |
|------|--------|
| Production URL | https://tto-ra.vercel.app |
| GitHub repo | https://github.com/matidiswiss/TTO-Reporting-Agent |
| Supabase project | `atnrdggjbfaosjqafkor` (NAISU_COMM) |
| Auth | RPC `tto_login(username, password)` → `sessionStorage` |
| Login routes | `/login` → dashboard `/dashboard` |
| Test user | `bilal` (password in `tto_app_users`) |

**Deliverables hosting (dashboard links in `preview/js/deliverables.js`):**

- Wound deck (166MB) → GitHub Release tag `deliverables-jun-2026`
- Solution deck (45MB) → Supabase bucket `tto-deliverables` (public read)
- Source Excel → `exports/` in repo

Re-upload script: `scripts/upload-deliverables.sh` (needs `.env` with `SUPABASE_SECRET_KEY`, `GITHUB_TOKEN`).

**Auto workflow:** After code changes, commit and push to `origin/main` (see `.cursor/rules/auto-commit-push.mdc`).

---

## Phase 1 — ✅ Done (`f8085e9`)

- [x] Web dashboard (`preview/index.html`, `preview/js/dashboard.js`)
- [x] Supabase auth gate (`preview/js/auth.js`, `preview/login.html`)
- [x] Vercel deploy + route rewrites (`vercel.json`)
- [x] Fix login redirect loop + JS module paths on rewrites
- [x] CDN cache bust (`auth.js?v=4`, `Cache-Control: no-store`)
- [x] Deliverables: GitHub Release (Wound) + Supabase Storage (Solution)
- [x] Dashboard data sync: creator share vs **campaign** total views
- [x] Dynamic insights from `data.json` (not hardcoded HTML)
- [x] Formatted report date + footnote for campaign vs video view gap
- [x] Error banner when `data.json` fails to load
- [x] `scripts/upload-deliverables.sh`
- [x] Migration `002_tto_deliverables_storage.sql`

**Sample campaign in repo:** Betadine Antiseptic Solution (OLV) representing Betadine Wound portfolio (Solution, Ointment, Bening).

---

## Phase 2 — Core Reporting Pipeline (Next)

**Goal:** Repeatable `Excel → data.json + pptx` without relying on Cursor chat.

### Tasks

1. **`scripts/generate_report.py`**
   - Input: TikTok One `.xlsx` (path argument)
   - Output: `preview/data.json` + `output/*.pptx`
   - Dependencies: `pandas`, `openpyxl`, `python-pptx` (add `requirements.txt`)

2. **Excel parsing**
   - Sheets: Campaign Report, Campaign History Report, Video Report
   - Match structure of `exports/TIKTOK ONE REPORT - Betadine Antiseptic Solution (OLV - Online Video).xlsx`
   - Preserve `data.json` schema: `campaign`, `creators`, `top_videos`, `history`, `meta`

3. **PPT generation**
   - `--format solution` → ~7 slides (single product)
   - `--format wound` → 16 slides (Solution / Ointment / Bening sections)
   - Template: copy/adapt from `references/FOLO - Report TTO Wound (Mar-Apr).pptx` (local)
   - Reuse logic from initial manual generation (slide deletion, text replacement, metrics textboxes)
   - QA: campaign-level numbers for overview; flag video vs campaign view gaps

4. **CLI**
   ```bash
   python scripts/generate_report.py \
     --input exports/foo.xlsx \
     --format wound \
     --period "Jun 2026" \
     --brand "Betadine Wound (Solution, Ointment, Bening)"
   ```

5. **Docs**
   - Update `README.md` with generate + upload workflow
   - Optional: `scripts/generate_report.sh` wrapper

6. **After generate**
   - Run `./scripts/upload-deliverables.sh` to refresh hosted download URLs
   - Commit `preview/data.json` (and `exports/` if new file); never commit `output/` or `references/`

### Phase 2 acceptance criteria

- [ ] One command regenerates `data.json` from Excel; dashboard reflects new numbers without HTML edits
- [ ] One command produces Solution and/or Wound `.pptx` in `output/`
- [ ] Upload script refreshes Supabase + GitHub Release assets
- [ ] README documents end-to-end flow for a new campaign export

### Known data quirks (handle in script / footnotes)

- Video-level view sum can be lower than campaign total views (~19K gap in sample data)
- Use campaign totals for KPIs/overview; note gap in output
- Jun 19 paid attribution anomaly in history (paid > total on one day) — document, don’t “fix”

---

## Phase 3 — Product Features

**Goal:** Self-serve dashboard for stakeholders; less manual file handling.

### Tasks

1. **Upload Excel in dashboard**
   - Client-side (SheetJS) or Vercel serverless endpoint
   - Trigger regenerate flow or upload pre-built `data.json`

2. **Content Video spotlight**
   - [x] Use `top_videos` in `data.json`
   - [x] Best Overall / Most Shared / Best Retention cards + TikTok video links from Excel

3. **Audience charts**
   - [x] Parse `Age distribution`, `Gender distribution`, `Countries or regions distribution` from campaign object (JSON strings today)
   - [x] Age + gender bar charts on dashboard (canvas)

4. **Product sections**
   - [x] Tabs or sections: Solution / Ointment / Bening
   - [x] Clear UX when only consolidated Wound export exists (Ointment/Bening placeholder tabs)
   - Requires separate Excel exports per product when available (today: single export stands for whole Wound line)

5. **Multi-campaign**
   - Store campaigns in Supabase table or multiple JSON files
   - Campaign selector in dashboard header

6. **Session polish**
   - Optional `localStorage` session with expiry
   - Env-based Supabase keys on Vercel (not hardcoded in `supabase-config.js`)

### Phase 3 acceptance criteria

- [ ] User can upload a new Excel and see updated dashboard without git commit
- [x] Spotlight videos visible with links
- [x] At least one audience breakdown chart on dashboard
- [x] Clear UX when only consolidated Wound data is available

---

## Phase 4 — Optional Polish

- Admin UI for `tto_app_users`
- Pre-commit hook or CI check: Excel changed → regenerate `data.json`
- Campaign Metrics slides: embed TikTok One screenshots if user provides assets
- Compress or split Wound deck if Supabase file limit increases (currently Wound must use GitHub Release)

---

## Key Files Map

```
preview/
  index.html          Dashboard shell
  login.html          Auth UI
  data.json           Campaign data (generated)
  js/
    auth.js           Session + tto_login RPC
    dashboard.js      KPIs, chart, insights, errors
    deliverables.js   Download URLs
    supabase-config.js

scripts/
  generate_report.py  (Phase 2 — TO BUILD)
  upload-deliverables.sh
  git-with-token.sh

supabase/migrations/
  001_tto_auth.sql
  002_tto_deliverables_storage.sql

vercel.json           Rewrites: /login, /dashboard, /data.json, /exports/*
```

---

## Handoff Prompt (New Agent)

Copy into a new Agent session:

```
Read ROADMAP.md in this repo. Phase 1 is complete (commit f8085e9).

Implement Phase 2:
- scripts/generate_report.py (Excel → preview/data.json + output/*.pptx)
- requirements.txt, README updates
- Reuse references/ and logic described in ROADMAP.md
- After changes: commit and push to origin/main per .cursor/rules/auto-commit-push.mdc

references/ and output/ exist locally on disk (gitignored). Sample Excel in exports/.
Do not commit .env, output/, or references/.
```

---

## Changelog

| Date | Phase | Commit | Summary |
|------|-------|--------|---------|
| Jul 2026 | 1 | `f8085e9` | Deliverables hosting, dashboard sync, error states |
| Jul 2026 | 0 | `bd691d6` | Initial web preview dashboard |
| Jul 2026 | 0 | `4f68d73` | Supabase auth |
