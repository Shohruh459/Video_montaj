#!/usr/bin/env bash
# Sifat tekshiruvi: o'lcham, fps, davomiylik, ovoz balandligi, qora kadr/jimlik.
# Ishlatish: scripts/qc.sh out.mp4
set -euo pipefail
f="$1"
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,codec_name,pix_fmt -show_entries format=duration -of default=nw=1 "$f"
echo "--- Ovoz balandligi (maqsad: I ≈ -14 LUFS, TP ≤ -1 dB)"
ffmpeg -nostats -i "$f" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|True peak):|Peak:" | tail -3
echo "--- Qora kadrlar"; ffmpeg -nostats -i "$f" -vf blackdetect=d=0.3:pix_th=0.05 -an -f null - 2>&1 | grep blackdetect || echo "yo'q"
echo "--- Kutilmagan jimlik"; ffmpeg -nostats -i "$f" -af silencedetect=n=-45dB:d=1.5 -vn -f null - 2>&1 | grep silence_start || echo "yo'q"
