#!/usr/bin/env bash
# Yakuniy eksport: H.264 High, yuqori sifat, tezkor ko'rish uchun faststart.
# Ishlatish: scripts/export.sh in.mp4 out.mp4 [vertical|horizontal]
set -euo pipefail
IN="$1"; OUT="$2"; MODE="${3:-horizontal}"
case "$MODE" in
  vertical)   VF="scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,fps=30,format=yuv420p" ;;
  *)          VF="scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=30,format=yuv420p" ;;
esac
ffmpeg -y -i "$IN" -vf "$VF" -c:v libx264 -preset slow -crf 17 -profile:v high \
  -c:a aac -b:a 256k -ar 48000 -movflags +faststart "$OUT"
