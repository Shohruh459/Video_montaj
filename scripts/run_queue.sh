#!/usr/bin/env bash
# Loyihalar navbati: bash scripts/run_queue.sh projects/a projects/b ...  (har biri --final; natija xulosasi stdout'da)
cd "$(dirname "$0")/.."
bash scripts/start_voice.sh >/dev/null 2>&1
for p in "$@"; do
  echo "===== $p"
  python3 scripts/make_video.py "$p" --final 2>&1 | grep -E "nutq|musiqa|TAYYOR|I:|Peak|yo'q|XATO|Error|OGOHL|Traceback" | grep -v "^\[libx264"
  python3 scripts/check_music.py "$p" 2>&1 | tail -n +2
done
echo "NAVBAT TUGADI"
