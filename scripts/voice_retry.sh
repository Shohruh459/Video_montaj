#!/bin/bash
# Ishlatish: bash scripts/voice_retry.sh projects/<loyiha>/specs/NN.json  (holat: /tmp/voice_retry.status)
# reel_voice.py ni muvaffaqiyatga qadar qayta urinadi (429/400 vaqtinchalik bo'lsa)
cd /home/user/Video_montaj
for i in $(seq 1 12); do
  python3 scripts/reel_voice.py "$1" > /tmp/voice_try.log 2>&1 && { cp /tmp/voice_try.log /tmp/voice_retry.done; echo OK > /tmp/voice_retry.status; exit 0; }
  echo "urinish $i xato: $(grep -E 'HTTP Error|XATO' /tmp/voice_try.log | tail -1)" >> /tmp/voice_retry.log; sleep 25
done
echo FAIL > /tmp/voice_retry.status
