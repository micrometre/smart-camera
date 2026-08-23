import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const isVercel = !!process.env.VERCEL;
  if (!isVercel) {
    return new NextResponse('Not found', { status: 404 });
  }

  try {
    const pathParams = params.path || [];
    const filename = Array.isArray(pathParams) ? pathParams.join('/') : pathParams;
    const imgPath = path.join('/tmp', 'images', filename);
    
    const fileBuffer = await fs.readFile(imgPath);
    
    // Determine content type based on extension
    let contentType = 'image/png';
    if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
      contentType = 'image/jpeg';
    } else if (filename.endsWith('.webp')) {
      contentType = 'image/webp';
    }

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Failed to serve image from /tmp:', error);
    return new NextResponse('Image not found', { status: 404 });
  }
}
