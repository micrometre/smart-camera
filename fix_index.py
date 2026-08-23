import re

with open('public/index.html', 'r') as f:
    content = f.read()

# 1. HTML elements
content = content.replace('        <span class="rec-timer" id="recTimer"><span class="dot"></span><span id="recTime">0:00</span></span>\n', '')
content = content.replace('      <div class="gallery" id="gallery"></div>\n\n', '')
content = content.replace('      <div class="flash" id="flash"></div>\n\n', '')
content = content.replace('        <button id="pauseButton" class="icon-btn pause" aria-label="Pause recording" hidden></button>\n', '')
content = re.sub(r'  <!-- Off-screen canvas: annotated frames are drawn here and recorded via captureStream\(\) -->\n  <canvas id="captureCanvas" hidden></canvas>\n\n', '', content)

# 2. JS Variables
js_vars_to_remove = [
    "    const gallery = document.getElementById('gallery');\n",
    "    const flash = document.getElementById('flash');\n",
    "    const recTimer = document.getElementById('recTimer');\n",
    "    const recTime = document.getElementById('recTime');\n",
    "    const pauseBtn = document.getElementById('pauseButton');\n",
    "    const captureCanvas = document.getElementById('captureCanvas');\n",
    "    const captureCtx = captureCanvas.getContext('2d');\n",
]
for var in js_vars_to_remove:
    content = content.replace(var, '')

js_state_to_remove = [
    "    const RECORD_FPS = 10;        // playback speed for the detection-only video\n",
    "    const MAX_CLIPS = 20;        // cap stored clips to limit memory use\n",
    "    let isRecording = false;\n",
    "    let isPaused = false;      // recording paused (frames not captured)\n",
    "    let isExporting = false;     // rendering the final video\n",
    "    let recordedFrames = [];      // ImageBitmaps of detection events\n",
    "    let mediaRecorder = null;\n",
    "    let recordedChunks = [];\n",
    "    let recStartTs = 0;\n",
    "    let recTimerId = null;\n",
]
for state in js_state_to_remove:
    content = content.replace(state, '')

# 3. JS Logic
content = content.replace(
    "    async function onShutter() {\n      if (!model || isExporting) return;\n      if (!streaming) { enableCam(); return; }\n      if (!isRecording) startRecording(); else await stopRecording();\n    }",
    "    async function onShutter() {\n      if (!model) return;\n      if (!streaming) { enableCam(); return; }\n    }"
)

content = content.replace(
    "            enableBtn.classList.remove('active');\n            statusPill.textContent = 'Tap to record';\n",
    "            enableBtn.classList.remove('active');\n            enableBtn.style.display = 'none';\n            statusPill.textContent = 'Detecting objects...';\n"
)

rec_block = """        // While recording, capture and store the annotated frame only if objects are detected.
        if (isRecording && !isPaused && detections.length > 0 && recordedFrames.length < 1000) {
          drawAnnotatedFrame(detections, srcW, srcH);
          createImageBitmap(captureCanvas).then(bitmap => {
            recordedFrames.push(bitmap);

            // Brief flash on the first frame of a detection sequence
            if (recordedFrames.length % 10 === 1) {
              flash.classList.remove('fire');
              void flash.offsetWidth;
              flash.classList.add('fire');
            }
          });
        }
"""
content = content.replace(rec_block, "")

# Remove drawAnnotatedFrame and recording functions up to </script>
idx = content.find('    // ── Draw only the detected regions (black background) onto the canvas ────')
end_idx = content.find('  </script>', idx)
if idx != -1 and end_idx != -1:
    content = content[:idx] + content[end_idx:]

# 4. CSS Removals
# Remove icon-btn CSS
icon_btn_start = content.find('    /* Pause / resume button — styled like the shutter, shown only while recording */')
icon_btn_end = content.find('    .shutter {')
if icon_btn_start != -1 and icon_btn_end != -1:
    content = content[:icon_btn_start] + content[icon_btn_end:]

# Remove recording shutter states, gallery, rec-timer, flash CSS
recording_css_start = content.find('    /* Recording state: red dot that morphs into a stop square */')
detection_overlays_start = content.find('    /* Detection overlays */')
if recording_css_start != -1 and detection_overlays_start != -1:
    content = content[:recording_css_start] + content[detection_overlays_start:]

gallery_css_start = content.find('    /* Recorded-clips gallery */')
style_end = content.find('  </style>')
if gallery_css_start != -1 and style_end != -1:
    content = content[:gallery_css_start] + content[style_end:]

with open('public/index.html', 'w') as f:
    f.write(content)

print("Done updating index.html")
