import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const IS_VERCEL = !!process.env.VERCEL;
const DATA_FILE = IS_VERCEL ? '/tmp/detections.json' : path.join(process.cwd(), 'detections.json');

export async function POST(request) {
  try {
    const { ids } = await request.json();
    if (!Array.isArray(ids)) {
      return NextResponse.json({ error: 'ids must be an array' }, { status: 400 });
    }

    let data = '[]';
    try {
      data = await fs.readFile(DATA_FILE, 'utf8');
    } catch {
      await fs.writeFile(DATA_FILE, '[]');
    }
    let allDetections = JSON.parse(data);
    
    const toDelete = allDetections.filter(entry => ids.includes(entry.id));
    
    for (const entry of toDelete) {
      if (entry.imagePath) {
        const imgPath = IS_VERCEL 
          ? path.join('/tmp', entry.imagePath.replace('/images/', 'images/')) 
          : path.join(process.cwd(), 'public', entry.imagePath);
        await fs.unlink(imgPath).catch(() => {});
      }
    }
    
    allDetections = allDetections.filter(entry => !ids.includes(entry.id));
    
    await fs.writeFile(DATA_FILE, JSON.stringify(allDetections, null, 2));
    return NextResponse.json({ success: true, deleted: toDelete.length });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete detections' }, { status: 500 });
  }
}
