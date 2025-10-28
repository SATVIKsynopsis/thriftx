import { NextResponse } from "next/server";
import { storage } from "@/firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { optimizeImage } from "@/middleware/sharpProcessor";
import { v4 as uuidv4 } from "uuid";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("images");

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, message: "No images provided" }, { status: 400 });
    }

    if (files.length > 5) {
      return NextResponse.json({ success: false, message: "Maximum of 5 images allowed" }, { status: 400 });
    }

    const uploadedUrls = [];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // 🔥 Optimize using Sharp
      const optimizedBuffer = await optimizeImage(buffer);

      // 🔥 Upload to Firebase Storage
      const fileName = `products/${uuidv4()}.webp`;
      const fileRef = ref(storage, fileName);
      await uploadBytes(fileRef, optimizedBuffer, { contentType: "image/webp" });

      const downloadURL = await getDownloadURL(fileRef);
      uploadedUrls.push(downloadURL);
    }

    return NextResponse.json({
      success: true,
      message: "Images uploaded successfully",
      urls: uploadedUrls,
    });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
