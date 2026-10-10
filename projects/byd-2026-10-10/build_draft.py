#!/usr/bin/env python3
"""Draft (540x960, ovozsiz): 5 sahna, xfade 0.4s, drawtext. Ishga tushirish: python3 build_draft.py"""
import subprocess, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
W, H, FPS, X = 540, 960, 30, 0.4
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
# (fayl, ss, davomiylik, crop x-nisbati)
clips = [("199", 10, 4.4, 0.5), ("340897", 0, 6.4, 0.5), ("4053", 5, 7.4, 0.5),
         ("200682", 2, 7.4, 0.5), ("19627", 3, 6.0, 0.35)]
inputs, fc = [], []
for i, (cid, ss, d, cx) in enumerate(clips):
    inputs += ["-ss", str(ss), "-t", str(d), "-i", f"broll/pixabay_video_{cid}.mp4"]
    fc.append(f"[{i}:v]fps={FPS},crop=ih*9/16:ih:(iw-ih*9/16)*{cx}:0,scale={W}:{H},setsar=1,format=yuv420p[v{i}]")
prev, length = "v0", clips[0][2]
for i in range(1, len(clips)):
    off = round(length - X, 3)
    fc.append(f"[{prev}][v{i}]xfade=transition=fade:duration={X}:offset={off}[x{i}]")
    prev, length = f"x{i}", length + clips[i][2] - X
starts = [0, 4.0, 10.0, 17.0, 24.0]; ends = [4.0, 10.0, 17.0, 24.0, 30.0]
def dt(txt, a, b, y, size, box=True):
    al = f"if(lt(t\\,{a}+0.3)\\,(t-{a})/0.3\\,if(gt(t\\,{b}-0.3)\\,({b}-t)/0.3\\,1))"
    bx = ":box=1:boxcolor=black@0.45:boxborderw=14" if box else ":shadowcolor=black@0.7:shadowx=2:shadowy=2"
    return (f"drawtext=fontfile={FONT}:textfile=text/{txt}.txt:fontcolor=white:fontsize={size}"
            f":x=(w-text_w)/2:y={y}:alpha='{al}':enable='between(t\\,{a}\\,{b})'{bx}")
layers = [dt("t1", 0.4, 3.8, "h*0.42", 44, False), dt("t2", 4.4, 9.6, "h*0.72", 40),
          dt("t3", 10.4, 16.6, "h*0.72", 36), dt("t4", 17.4, 23.6, "h*0.72", 36),
          dt("t5a", 24.4, 29.6, "h*0.40", 44, False), dt("t5b", 25.2, 29.6, "h*0.72", 30)]
fc.append(f"[{prev}]" + ",".join(layers) + ",fade=t=in:d=0.3,fade=t=out:st=29.7:d=0.3[out]")
cmd = ["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(fc), "-map", "[out]",
       "-r", str(FPS), "-c:v", "libx264", "-profile:v", "high", "-crf", "23", "-preset", "veryfast",
       "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", "out/draft_v1_silent.mp4"]
subprocess.run(cmd, check=True)
