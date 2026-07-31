#!/usr/bin/env bash
# Wrapper for scripts/generate_report.py — see README for full workflow.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

INPUT="${1:-exports/TIKTOK ONE REPORT - Betadine Antiseptic Solution (OLV - Online Video).xlsx}"
PERIOD="${PERIOD:-Jun 2026}"
BRAND="${BRAND:-Betadine Wound (Solution, Ointment, Bening)}"
FORMAT="${FORMAT:-both}"

python3 scripts/generate_report.py \
  --input "$INPUT" \
  --format "$FORMAT" \
  --period "$PERIOD" \
  --brand "$BRAND"
