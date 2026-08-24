# Smart Camera - Object Detection

A full-screen, Android-style camera app that performs real-time object detection using TensorFlow.js and the COCO-SSD pre-trained model.

## What it does

- Captures a live webcam stream in the browser
- Detects common objects (people, cars, pets, etc.) in real time
- Draws bounding boxes and confidence scores around detected objects
- **OPFS Local Storage** - Securely stores detections and images in your browser using Origin Private File System and SQLite-WASM.
- **Offline Capable** - No external backend needed for storage. Everything is isolated to the client.
- **WebGPU / WebGL** - GPU-accelerated backends for fast inference
- **COCO-SSD** - Pre-trained object detection model trained on the COCO dataset
- **Detection Dashboard** - Browse detection history and manage records locally and offline.

## How it works

1. **Start Camera** - Grant camera access and the app initializes the GPU backend and AI model.
2. **Detect Objects** - The AI analyzes each frame and identifies objects in real-time above a defined confidence threshold.
3. **Capture Locally** - When objects are detected, snapshots and metadata are saved automatically to your browser's private file system using SQLite-WASM.
4. **Review Data** - You can view and manage your captured detections offline in the dashboard powered by local SQLite.

## Running the App (Next.js)

This project has been migrated to a modern **Next.js** full-stack framework. 

To start the development server with hot reload:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
For the best experience, use a mobile device in portrait mode or your browser's device toolbar.

## What you'll learn

Based on the [TensorFlow.js Object Detection Codelab](https://codelabs.developers.google.com/codelabs/tensorflowjs-object-detection), this project demonstrates:

- Loading a pre-trained TensorFlow.js model
- Initializing WebGPU/WebGL backends for GPU acceleration
- Accessing the webcam stream via the MediaDevices API
- Running real-time inference on video frames
- Mapping model coordinates to a full-screen `object-fit: cover` video feed
- Drawing detection results as overlays

## Storage Architecture

This app utilizes a **Local-First Architecture**. Instead of persisting data to an ephemeral serverless backend, all detection history is stored directly on the client.

### OPFS & SQLite-WASM

- **Origin Private File System (OPFS)**: The browser's native, high-performance file system.
- **SQLite-WASM**: An official WebAssembly build of SQLite that leverages OPFS for data persistence.
- **COOP/COEP Headers**: The Next.js `next.config.mjs` enables Cross-Origin isolation (`Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy`), which allows the use of `SharedArrayBuffer` for blazing-fast SQLite operations in the browser. 

## Deployment

### Deploying to Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

A `vercel.json` configuration file is included in this repository.
You can deploy using the Vercel CLI:

```bash
npx vercel
```

**Note on Vercel Data Persistence:**
Because the app uses OPFS for storage, it avoids Vercel's ephemeral serverless file system limitations entirely. Your detections will persist securely in your browser's file system across sessions without needing a cloud database!

### Deploying with Docker

Alternatively, a complete `docker-compose` setup is provided in the `/docker` directory. See the Docker files for details on self-hosting the application with local file persistence.

## Next steps

- [View all objects COCO-SSD can recognize](https://github.com/tensorflow/tfjs-models/blob/master/coco-ssd/src/classes.ts)
- Add custom actions when specific objects are detected
- Integrate with a backend for notifications (e.g., via WebSockets)
- Explore more [TensorFlow.js codelabs](https://codelabs.developers.google.com/codelabs/tensorflowjs-object-detection#7)

## License

MIT
