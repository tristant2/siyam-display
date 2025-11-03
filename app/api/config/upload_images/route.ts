import { getPublicUrlFromKey, uploadData } from "@/lib/cloudflare";
import { NextResponse } from "next/server";
import { readdir, readFile } from "fs/promises";
import { join } from "path";

const getMimeType = (fileName: string): string => {
  const ext = fileName.toLowerCase().split(".").pop();
  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
  };
  return mimeTypes[ext || ""] || "application/octet-stream";
};

export async function POST() {
  try {
    const imagesDir = join(process.cwd(), "public", "product_images");
    const files = await readdir(imagesDir);

    // Filter for image files
    const imageFiles = files.filter(
      (file) =>
        file.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) && !file.startsWith(".")
    );

    if (imageFiles.length === 0) {
      return NextResponse.json(
        { error: "No image files found" },
        { status: 404 }
      );
    }

    const uploadResults = await Promise.allSettled(
      imageFiles.map(async (fileName) => {
        const filePath = join(imagesDir, fileName);
        const fileBuffer = await readFile(filePath);
        const mimeType = getMimeType(fileName);

        const fileKey = `product_images/${fileName}`;
        await uploadData(fileBuffer, fileKey, mimeType);
        const image_url = getPublicUrlFromKey(fileKey);

        return {
          fileName,
          image_url,
          image_key: fileKey,
        };
      })
    );

    const successful = uploadResults
      .filter((result) => result.status === "fulfilled")
      .map((result) => (result.status === "fulfilled" ? result.value : null))
      .filter(Boolean);

    const failed = uploadResults
      .filter((result) => result.status === "rejected")
      .map((result) => (result.status === "rejected" ? result.reason : null))
      .filter(Boolean);

    return NextResponse.json({
      message: `Uploaded ${successful.length} of ${imageFiles.length} images`,
      successful,
      failed: failed.length > 0 ? failed : undefined,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload images", details: String(error) },
      { status: 500 }
    );
  }
}
