const video = document.getElementById('webcam');
const liveView = document.getElementById('liveView');
const demosSection = document.getElementById('demos');
const enableWebcamButton = document.getElementById('webcamButton');
const statusPill = document.getElementById('statusPill');

// Store the resulting model in the global scope of our app.
let model = undefined;
let children = [];

// Check if webcam access is supported.
function getUserMediaSupported() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

// If webcam supported, add event listener to button for when user
// wants to activate it.
if (getUserMediaSupported()) {
  enableWebcamButton.addEventListener('click', enableCam);
} else {
  statusPill.innerText = 'Webcam not supported';
  console.warn('getUserMedia() is not supported by your browser');
}

// The shutter is disabled until the model finishes loading.
enableWebcamButton.disabled = true;

// Before we can use COCO-SSD class we must wait for it to finish loading.
cocoSsd.load().then(function (loadedModel) {
  model = loadedModel;
  // Model ready: hide the loading overlay and enable the shutter.
  demosSection.classList.remove('loading');
  enableWebcamButton.disabled = false;
  statusPill.innerText = 'Tap the shutter to start';
});

// Enable the live webcam view and start classification.
function enableCam(event) {
  // Only continue if the COCO-SSD has finished loading.
  if (!model) {
    return;
  }
  
  // Switch the shutter into its active (detecting) state.
  event.target.classList.add('active');
  statusPill.innerText = 'Detecting\u2026';

  // getUsermedia parameters: prefer the rear camera in portrait.
  const constraints = {
    video: { facingMode: 'environment' }
  };

  // Activate the webcam stream.
  navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
    video.srcObject = stream;
    video.addEventListener('loadeddata', predictWebcam);
  }).catch(function (err) {
    statusPill.innerText = 'Camera access denied';
    event.target.classList.remove('active');
    console.error(err);
  });
}

function predictWebcam() {
  // Now let's start classifying a frame in the stream.
  model.detect(video).then(function (predictions) {
    // Remove any highlighting we did previous frame.
    for (let i = 0; i < children.length; i++) {
      liveView.removeChild(children[i]);
    }
    children.splice(0);
    
    // Now lets loop through predictions and draw them to the live view if
    // they have a high confidence score.
    for (let n = 0; n < predictions.length; n++) {
      // If we are over 66% sure we are sure we classified it right, draw it!
      if (predictions[n].score > 0.66) {
        const p = document.createElement('p');
        p.setAttribute('class', 'detection-label');
        p.innerText = predictions[n].class  + ' - ' 
            + Math.round(parseFloat(predictions[n].score) * 100) 
            + '%';
        
        // The video uses object-fit: cover, so the source frame is scaled
        // uniformly and centre-cropped. Map model coordinates accordingly.
        const containerWidth = liveView.clientWidth;
        const containerHeight = liveView.clientHeight;
        const sourceWidth = video.videoWidth || 640;
        const sourceHeight = video.videoHeight || 480;
        const scale = Math.max(containerWidth / sourceWidth, containerHeight / sourceHeight);
        const offsetX = (containerWidth - sourceWidth * scale) / 2;
        const offsetY = (containerHeight - sourceHeight * scale) / 2;

        const left = predictions[n].bbox[0] * scale + offsetX;
        const top = predictions[n].bbox[1] * scale + offsetY;
        const width = predictions[n].bbox[2] * scale;
        const height = predictions[n].bbox[3] * scale;

        p.style.left = left + 'px';
        p.style.top = (top - 24) + 'px';

        const highlighter = document.createElement('div');
        highlighter.setAttribute('class', 'highlighter');
        highlighter.style.left = left + 'px';
        highlighter.style.top = top + 'px';
        highlighter.style.width = width + 'px';
        highlighter.style.height = height + 'px';

        liveView.appendChild(highlighter);
        liveView.appendChild(p);
        children.push(highlighter);
        children.push(p);
      }
    }
    
    // Call this function again to keep predicting when the browser is ready.
    window.requestAnimationFrame(predictWebcam);
  });
}
