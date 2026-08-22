# Smart Camera - Object Detection

A full-screen, Android-style camera app that performs real-time object detection using TensorFlow.js and the COCO-SSD pre-trained model.

## What it does

- Captures a live webcam stream in the browser
- Detects common objects (people, cars, pets, etc.) in real time
- Draws bounding boxes and confidence scores around detected objects
- **Detection-Only Export** - Instead of recording empty video, the app captures frames only when objects are detected and compiles them into a condensed MP4/WebM video
- **Intelligent Frame Capture** - Efficiently stores detection events as ImageBitmaps to preserve memory during capture
- **In-Browser Rendering** - Reconstructs the video at a smooth 10 FPS upon stopping the recording
- **WebGPU / WebGL** - GPU-accelerated backends for fast inference
- **COCO-SSD** - Pre-trained object detection model trained on the COCO dataset
- **Gallery & Download** - Recorded clips appear in a sidebar gallery; tap to download the processed file

## How it works

The app initializes the GPU backend and loads the COCO-SSD model. Once recording is active, the system monitors the video feed but only captures frames when objects are detected above the user-defined confidence threshold. 

When recording is stopped, the app enters an **Export Phase**: it renders the stored detection frames sequentially to a hidden canvas and records the stream using the `MediaRecorder` API. This results in a "highlight reel" video containing only relevant detection events, exported as an MP4 or WebM file.

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

## Backend API

The project includes a Node.js/Express backend server to capture and store detected objects.

### Installation

```bash
npm install
```

### Running the backend

```bash
npm run server
```

The server will start on `http://localhost:3000`.

### API Endpoints

- **POST /api/detections** - Capture detection data
  - Body: `{ detections: [{ class, score, bbox }], timestamp }`
  - Returns: `{ success: true, id }`

- **GET /api/detections** - Retrieve detection history
  - Query params: `limit` (number), `class` (filter by class)
  - Returns: Array of detection entries (newest first)

- **GET /api/stats** - Get detection statistics
  - Returns: `{ totalEntries, totalDetections, classCounts, lastDetection }`

- **DELETE /api/detections** - Clear all detection data
  - Returns: `{ success: true }`

Detection data is stored in `detections.json` (max 1000 entries).

## Next steps

- [View all objects COCO-SSD can recognize](https://github.com/tensorflow/tfjs-models/blob/master/coco-ssd/src/classes.ts)
- Add custom actions when specific objects are detected
- Integrate with a backend for notifications (e.g., via WebSockets)
- Explore more [TensorFlow.js codelabs](https://codelabs.developers.google.com/codelabs/tensorflowjs-object-detection#7)

## License

MIT
