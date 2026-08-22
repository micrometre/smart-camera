import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const DATA_FILE = path.join(process.cwd(), 'detections.json');

export async function GET(request) {
  try {
    let data = '[]';
    try {
      data = await fs.readFile(DATA_FILE, 'utf8');
    } catch {
      await fs.writeFile(DATA_FILE, '[]');
    }
    const allDetections = JSON.parse(data);

    const classCounts = {};
    let totalDetections = 0;

    allDetections.forEach(entry => {
      entry.detections.forEach(d => {
        classCounts[d.class] = (classCounts[d.class] || 0) + 1;
        totalDetections++;
      });
    });

    const stats = {
      totalEntries: allDetections.length,
      totalDetections,
      classCounts,
      lastDetection: allDetections.length > 0 ? allDetections[allDetections.length - 1].timestamp : null
    };

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to calculate statistics' }, { status: 500 });
  }
}
