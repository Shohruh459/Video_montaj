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
