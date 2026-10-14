#!/usr/bin/env bash
# Ishlatish: bash templates/kinetic/render.sh <uslub> <out.mp4> [scale=0.5] [props.json]
# Uslublar: kino-oltin | split-oyna | jurnal | neon | minimal-oq | afisha   (STYLES.md ga qarang)
# props.json berilmasa src/data/sample.json olinadi. Chiqish yuv420p (tv diapazon), faststart.
set -euo pipefail
cd "$(dirname "$0")"
STYLE="$1"; OUT="$(realpath -m "$2")"; SCALE="${3:-0.5}"; PROPS="${4:-src/data/sample.json}"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
python3 - "$PROPS" "$STYLE" "$TMP/props.json" <<'PY'
import json, sys
d = json.load(open(sys.argv[1], encoding="utf-8")); d["style"] = sys.argv[2]
json.dump(d, open(sys.argv[3], "w", encoding="utf-8"), ensure_ascii=False)
PY
npx remotion render src/index.ts Sample "$TMP/raw.mp4" --props="$TMP/props.json" --scale="$SCALE" --crf=18 --pixel-format=yuv420p >/dev/null
ffmpeg -v error -y -i "$TMP/raw.mp4" -vf "scale=in_range=pc:out_range=tv,format=yuv420p" -c:v libx264 -preset medium -crf 18 -r 30 -c:a copy -movflags +faststart "$OUT"
echo "TAYYOR: $OUT"
