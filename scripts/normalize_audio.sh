#!/usr/bin/env bash
# Ovozni ommaviy standartga keltiradi: -14 LUFS (YouTube/Instagram/TikTok), -1 dBTP.
# Ishlatish: scripts/normalize_audio.sh in.mp3 out.wav
set -euo pipefail
ffmpeg -y -i "$1" -af "highpass=f=70,loudnorm=I=-14:TP=-1.0:LRA=11" -ar 48000 -ac 2 "$2"
