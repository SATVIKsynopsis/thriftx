import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/firebase/config';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('images'); // Expect images as array

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    if (files.length > 5) {
      return NextResponse.json({ error: 'Maximum 5 images allowed' }, { status: 400 });
    }

    const processedUrls = [];

    // Extract userId from formData (send it from client for path)
    const userId = formData.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    for (const file of files) {
      if (!(file instanceof File) || !file.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
      }

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Process image with Sharp
      const processedBuffer = await sharp(buffer)
        .resize(800, 800, {
          fit: sharp.fit.inside, // Maintain aspect ratio
          withoutEnlargement: true, // Don't enlarge smaller images
        })
        .webp({ // Convert to webp for better compression
          quality: 80, // 80% quality for good balance
        })
        .toBuffer();

      // Upload to Firebase Storage
      const imageRef = ref(storage, `products/${userId}/processed-${uuidv4()}.webp`);
      await uploadBytes(imageRef, processedBuffer, {
        contentType: 'image/webp',
      });

      // Get download URL
      const url = await getDownloadURL(imageRef);
      processedUrls.push(url);
    }

    return NextResponse.json({ urls: processedUrls });

  } catch (error) {
    console.error('Image processing error:', error);
    return NextResponse.json({ error: 'Image processing failed' }, { status: 500 });
  }
}
