#!/usr/bin/env bash
# Upload TTO deliverables to Supabase Storage (Solution deck) and GitHub Release (Wound deck).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

: "${SUPABASE_URL:?SUPABASE_URL missing in .env}"
: "${SUPABASE_SECRET_KEY:?SUPABASE_SECRET_KEY missing in .env}"
: "${GITHUB_TOKEN:?GITHUB_TOKEN missing in .env}"

BUCKET_BASE="${SUPABASE_URL}/storage/v1/object/tto-deliverables"
SOLUTION_SRC="output/FOLO - Report TTO Betadine Antiseptic Solution (Jun 2026).pptx"
SOLUTION_DEST="FOLO-Report-TTO-Betadine-Solution-Jun-2026.pptx"
WOUND_SRC="output/FOLO - Report TTO Betadine Wound (Jun 2026).pptx"
WOUND_DEST="FOLO-Report-TTO-Betadine-Wound-Jun-2026.pptx"
RELEASE_TAG="deliverables-jun-2026"

upload_supabase() {
  local dest="$1" src="$2"
  echo "→ Supabase: $dest"
  curl -sS -X POST "${BUCKET_BASE}/${dest}" \
    -H "Authorization: Bearer ${SUPABASE_SECRET_KEY}" \
    -H "apikey: ${SUPABASE_SECRET_KEY}" \
    -H "Content-Type: application/vnd.openxmlformats-officedocument.presentationml.presentation" \
    -H "x-upsert: true" \
    --data-binary "@${src}"
  echo ""
}

upload_github_release() {
  local src="$1" name="$2"
  local upload_url
  upload_url=$(curl -sS -H "Authorization: token ${GITHUB_TOKEN}" \
    "https://api.github.com/repos/matidiswiss/TTO-Reporting-Agent/releases/tags/${RELEASE_TAG}" | \
    python3 -c "import sys,json; print(json.load(sys.stdin)['upload_url'].replace('{?name,label}',''))")

  echo "→ GitHub Release: $name"
  curl -sS -X POST \
    -H "Authorization: token ${GITHUB_TOKEN}" \
    -H "Content-Type: application/vnd.openxmlformats-officedocument.presentationml.presentation" \
    --data-binary "@${src}" \
    "${upload_url}?name=${name}"
  echo ""
}

[[ -f "$SOLUTION_SRC" ]] && upload_supabase "$SOLUTION_DEST" "$SOLUTION_SRC"
[[ -f "$WOUND_SRC" ]] && upload_github_release "$WOUND_SRC" "$WOUND_DEST"

echo "Done. URLs are configured in preview/js/deliverables.js"
