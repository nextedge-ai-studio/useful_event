import { PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

import { r2Client } from "@/lib/r2/client";
import { supabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;
const rateLimitMap = new Map<string, { count: number; startedAt: number }>();

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILES = 6;

export async function POST(request: Request) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor?.split(",")[0]?.trim() || "unknown";
    const now = Date.now();
    const rateState = rateLimitMap.get(ip);
    if (!rateState || now - rateState.startedAt > RATE_LIMIT_WINDOW_MS) {
      rateLimitMap.set(ip, { count: 1, startedAt: now });
    } else {
      rateState.count += 1;
      if (rateState.count > RATE_LIMIT_MAX) {
        return Response.json({ error: "Too many requests" }, { status: 429 });
      }
    }

    const authHeader = request.headers.get("authorization");
    const accessToken = authHeader?.replace("Bearer ", "");
    if (!accessToken) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userData, error: userError } =
      await supabaseServer.auth.getUser(accessToken);
    if (userError || !userData.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files");
    const file = formData.get("file");
    const userId = userData.user.id;

    const inputFiles = files.length > 0 ? files : file ? [file] : [];

    if (inputFiles.length === 0) {
      return Response.json({ error: "Missing file" }, { status: 400 });
    }
    if (inputFiles.length > MAX_FILES) {
      return Response.json({ error: "Too many files" }, { status: 400 });
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
      if (!ALLOWED_TYPES.has(inputFile.type)) {
        return Response.json({ error: "Invalid file type" }, { status: 400 });
      }
      if (inputFile.size > MAX_FILE_SIZE) {
        return Response.json({ error: "File too large" }, { status: 400 });
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
