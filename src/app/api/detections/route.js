import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const DATA_FILE = path.join(process.cwd(), 'detections.json');
const IMAGES_DIR = path.join(process.cwd(), 'public', 'images');

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const filterClass = searchParams.get('class');
    
    let data = '[]';
    try {
      data = await fs.readFile(DATA_FILE, 'utf8');
    } catch {
      await fs.writeFile(DATA_FILE, '[]');
    }
    
    let allDetections = JSON.parse(data);

    if (filterClass) {
      allDetections = allDetections.filter(entry => 
        entry.detections.some(d => d.class.toLowerCase() === filterClass.toLowerCase())
      );
    }

    if (limit) {
      allDetections = allDetections.slice(-parseInt(limit));
    }

    return NextResponse.json(allDetections.reverse());
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read detections' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { detections, timestamp, image } = await request.json();
    
    if (!Array.isArray(detections)) {
      return NextResponse.json({ error: 'Detections must be an array' }, { status: 400 });
    }

    let data = '[]';
    try {
      data = await fs.readFile(DATA_FILE, 'utf8');
    } catch {
      await fs.writeFile(DATA_FILE, '[]');
    }
    const allDetections = JSON.parse(data);

    let imagePath = null;
    if (image) {
      try {
        await fs.mkdir(IMAGES_DIR, { recursive: true });
        const dateObj = timestamp ? new Date(timestamp) : new Date();
        const pad = n => String(n).padStart(2, '0');
        const formattedDate = `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}_${pad(dateObj.getHours())}-${pad(dateObj.getMinutes())}-${pad(dateObj.getSeconds())}`;
        const filename = `detection_${formattedDate}.png`;
        const fullImagePath = path.join(IMAGES_DIR, filename);
        
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        await fs.writeFile(fullImagePath, buffer);
        
        imagePath = `/images/${filename}`;
      } catch (imgError) {
        console.error('Error saving image:', imgError);
      }
    }

    const entry = {
      id: Date.now(),
      timestamp: timestamp || new Date().toISOString(),
      detections: detections.map(d => ({
        class: d.class,
        score: d.score,
        bbox: d.bbox
      })),
      imagePath
    };

    allDetections.push(entry);

    if (allDetections.length > 1000) {
      allDetections.splice(0, allDetections.length - 1000);
    }

    await fs.writeFile(DATA_FILE, JSON.stringify(allDetections, null, 2));

    return NextResponse.json({ success: true, id: entry.id, imagePath });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save detections' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    let data = '[]';
    try {
      data = await fs.readFile(DATA_FILE, 'utf8');
    } catch {
      await fs.writeFile(DATA_FILE, '[]');
    }
    const allDetections = JSON.parse(data);
    
    for (const entry of allDetections) {
      if (entry.imagePath) {
        const imgPath = path.join(process.cwd(), 'public', entry.imagePath);
        await fs.unlink(imgPath).catch(() => {});
      }
    }

    await fs.writeFile(DATA_FILE, JSON.stringify([]));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to clear detections' }, { status: 500 });
  }
}
