# Smart Camera - Object Detection

A full-screen, Android-style camera app that performs real-time object detection using TensorFlow.js and the COCO-SSD pre-trained model.

## What it does

- Captures a live webcam stream in the browser
- Detects common objects (people, cars, pets, etc.) in real time
- Draws bounding boxes and confidence scores around detected objects
- Runs entirely client-side with no server required

## Tech stack

- **TensorFlow.js** - Machine learning library for JavaScript
- **COCO-SSD** - Pre-trained object detection model trained on the COCO dataset
- **Vite** - Fast development server and build tool
- **Vanilla JavaScript** - No framework dependencies

## How it works

The app loads the COCO-SSD model, requests camera access, and continuously classifies video frames. When an object is detected with >66% confidence, it draws a bounding box and label over the video feed.

## Running the app

```bash
npm install
npm run dev
```

Open the URL shown in your terminal. For the best experience, use a mobile device in portrait mode or your browser's device toolbar.

## What you'll learn

Based on the [TensorFlow.js Object Detection Codelab](https://codelabs.developers.google.com/codelabs/tensorflowjs-object-detection), this project demonstrates:

- Loading a pre-trained TensorFlow.js model
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
