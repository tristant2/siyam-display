import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { PutObjectCommandOutput } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3PublicBucketName = "siyam-display";

export const s3Client = new S3Client({
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  region: "auto",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_ACCESS_SECRET_KEY || "",
  },
});

export const uploadData = (
  data: Buffer,
  fileName: string,
  mimeType = "application/octet-stream"
) =>
  new Promise<PutObjectCommandOutput>((resolve, reject) => {
    s3Client
      .send(
        new PutObjectCommand({
          Bucket: s3PublicBucketName,
          Key: fileName,
          Body: data,
          ContentType: mimeType,
        })
      )
      .then((resp: PutObjectCommandOutput) => {
        resolve(resp);
      })
      .catch((err: Error) => {
        reject(err);
      });
  });

export const getPublicUrlFromKey = (key: string) => {
  return `https://pub-705ad826bed340ee9907e8e62361a06e.r2.dev/product_images/${key}`;
};
export const getSignedUrlFromKey = async (key: string, isPublic: boolean) => {
  const command = new GetObjectCommand({
    Bucket: s3PublicBucketName,
    Key: key,
  });
  const url = await getSignedUrl(s3Client, command);
  return url;
};
