# Smart Camera - Object Detection

A full-screen, Android-style camera app that performs real-time object detection using TensorFlow.js and the COCO-SSD pre-trained model.

## What it does

- Captures a live webcam stream in the browser
- Detects common objects (people, cars, pets, etc.) in real time
- Draws bounding boxes and confidence scores around detected objects
- Uses WebGPU for accelerated inference (falls back to WebGL)
- Adjustable confidence threshold via slider
- Runs entirely client-side with no server required

## Tech stack

- **TensorFlow.js** - Machine learning library for JavaScript
- **WebGPU / WebGL** - GPU-accelerated backends for fast inference
- **COCO-SSD** - Pre-trained object detection model trained on the COCO dataset
- **Vanilla JavaScript** - No framework dependencies

## How it works

The app initializes the GPU backend (WebGPU if available, otherwise WebGL), loads the COCO-SSD model, requests camera access, and continuously classifies video frames. When an object is detected above the confidence threshold, it draws a bounding box and label over the video feed.

## Running the app

Simply open `index.html` in a browser. No build step required.

For development with hot reload:

```bash
npm install
npm run dev
```

For the best experience, use a mobile device in portrait mode or your browser's device toolbar.

## What you'll learn

Based on the [TensorFlow.js Object Detection Codelab](https://codelabs.developers.google.com/codelabs/tensorflowjs-object-detection), this project demonstrates:

- Loading a pre-trained TensorFlow.js model
- Initializing WebGPU/WebGL backends for GPU acceleration
- Accessing the webcam stream via the MediaDevices API
- Running real-time inference on video frames
- Mapping model coordinates to a full-screen `object-fit: cover` video feed
- Drawing detection results as overlays

## Next steps

- [View all objects COCO-SSD can recognize](https://github.com/tensorflow/tfjs-models/blob/master/coco-ssd/src/classes.ts)
- Add custom actions when specific objects are detected
- Integrate with a backend for notifications (e.g., via WebSockets)
- Explore more [TensorFlow.js codelabs](https://codelabs.developers.google.com/codelabs/tensorflowjs-object-detection#7)

## License

MIT
