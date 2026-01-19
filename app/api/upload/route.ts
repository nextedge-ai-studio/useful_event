import { PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

import { r2Client } from "@/lib/r2/client";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files");
    const file = formData.get("file");
    const userId = formData.get("userId")?.toString() || "anonymous";

    const inputFiles = files.length > 0 ? files : file ? [file] : [];

    if (inputFiles.length === 0) {
      return Response.json({ error: "Missing file" }, { status: 400 });
    }

    const bucket = process.env.R2_BUCKET;
    const publicBaseUrl = process.env.R2_PUBLIC_URL;

    if (!bucket || !publicBaseUrl) {
      return Response.json(
        { error: "Missing R2 bucket configuration" },
        { status: 500 }
      );
    }

    const urls: string[] = [];

    for (const inputFile of inputFiles) {
      if (!(inputFile instanceof File)) {
        continue;
      }
      const buffer = Buffer.from(await inputFile.arrayBuffer());
      const webpBuffer = await sharp(buffer)
        .resize({ width: 1600, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();

      const timestamp = Date.now();
      const safeName = inputFile.name
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9.-]/g, "");
      const key = `useful/${userId}/${timestamp}-${safeName}.webp`;

      await r2Client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: webpBuffer,
          ContentType: "image/webp",
        })
      );

      urls.push(`${publicBaseUrl}/${key}`);
    }

    return Response.json({ urls });
  } catch (error) {
    console.error("Upload error:", error);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}
