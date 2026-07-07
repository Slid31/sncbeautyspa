import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "snc-beauty", resource_type: "image" },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve(result as { secure_url: string });
        }
      ).end(buffer);
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (err) {
    console.error("[upload] error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
