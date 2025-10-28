import sharp from 'sharp';

export async function POST(req) {
  try {
    const body = await req.json();
    const images = body.images || [];

    const optimized = await Promise.all(images.map(async (img) => {
      try {
        const { id, dataUrl, filename } = img;
        // dataUrl looks like: data:image/png;base64,AAA...
        const matches = /^data:(image\/[^;]+);base64,(.*)$/.exec(dataUrl);
        if (!matches) return { id, error: 'invalid_dataurl' };
        const mime = matches[1];
        const b64 = matches[2];
        const buffer = Buffer.from(b64, 'base64');

        // Resize/convert with sharp
        const out = await sharp(buffer)
          .rotate() // respect EXIF orientation
          .resize({ width: 1200, withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();

        const outB64 = out.toString('base64');
        const outDataUrl = `data:image/webp;base64,${outB64}`;
        const outName = filename ? filename.replace(/\.[^.]+$/, '.webp') : `${id || Date.now()}.webp`;

        return { id, filename: outName, dataUrl: outDataUrl };
      } catch (e) {
        return { id: img.id, error: e.message || String(e) };
      }
    }));

    return new Response(JSON.stringify({ images: optimized }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
