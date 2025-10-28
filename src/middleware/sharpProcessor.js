import sharp from "sharp";

/**
 * Optimize image using Sharp (resize + convert to WebP)
 * @param {Buffer} buffer - Original file buffer
 * @returns {Promise<Buffer>} Optimized WebP buffer
 */
export async function optimizeImage(buffer) {
  try {
    const optimized = await sharp(buffer)
      .resize({ width: 1200, withoutEnlargement: true }) // resize if larger than 1200px
      .webp({ quality: 80 })
      .toBuffer();

    return optimized;
  } catch (error) {
    console.error("Image optimization failed:", error);
    throw new Error("Image optimization failed");
  }
}
