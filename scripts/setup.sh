#!/usr/bin/env bash
# Serverni bir martada tayyorlash (Ubuntu/Debian). Ishlatish: bash scripts/setup.sh
set -euo pipefail
if command -v apt-get >/dev/null; then
  SUDO=""; [ "$(id -u)" -ne 0 ] && SUDO="sudo"
  $SUDO apt-get update -y
  $SUDO apt-get install -y ffmpeg fonts-dejavu fonts-noto fonts-noto-color-emoji python3-venv libsndfile1
fi
python3 -m venv .venv
. .venv/bin/activate
pip install -U pip
pip install -r requirements.txt
[ -f .env ] || cp .env.example .env
ffmpeg -hide_banner -encoders 2>/dev/null | grep -q libx264 || { echo "XATO: ffmpeg'da libx264 yo'q"; exit 1; }
echo "Tayyor. Tekshiruv: ffmpeg $(ffmpeg -version | head -1 | cut -d' ' -f3), python $(python3 -V)"

# --- Remotion (motion grafika) ---
if command -v npm >/dev/null; then
  (cd templates/remotion && npm ci --silent 2>/dev/null || npm i --silent)
  if ! ls /opt/pw-browsers/chromium_headless_shell-* >/dev/null 2>&1 && ! ls ~/.cache/ms-playwright/chromium_headless_shell-* >/dev/null 2>&1; then
    (cd templates/remotion && npx remotion browser ensure) || echo "OGOHLANTIRISH: Remotion brauzeri o'rnatilmadi (CHROMIUM_PATH bering)"
  fi
else
  echo "OGOHLANTIRISH: Node.js yo'q — Remotion ishlamaydi (faqat ffmpeg draft)."
fi
echo "Studio tayyor. Draft: python3 projects/<loyiha>/build_draft.py  |  Remotion: node templates/remotion/render.mjs projects/<loyiha>/scenes.json out.mp4"
