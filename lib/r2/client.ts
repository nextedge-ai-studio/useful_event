import { S3Client } from "@aws-sdk/client-s3";

const rawEndpoint = process.env.R2_ENDPOINT;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

if (!rawEndpoint || !accessKeyId || !secretAccessKey) {
  throw new Error("Missing R2 environment variables.");
}

const endpoint = rawEndpoint.startsWith("http")
  ? rawEndpoint
  : `https://${rawEndpoint}`;

export const r2Client = new S3Client({
  region: "auto",
  endpoint,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});
