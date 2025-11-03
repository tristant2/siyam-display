import { NextResponse } from "next/server";
import connectDB from "@/lib/ConnectDB";
import { Part, Detail } from "@/models/part";
import csv from "csv-parser";
import fs from "fs";

interface CSVRow {
  [key: string]: string;
}

interface ProcessedPart {
  siyam_ref: string;
  action: "created" | "updated";
}

const CSV_FILE_PATH =
  "/Users/tristantsvetanov/Desktop/siyam-display/csv/siyam touch screen items - flattend.csv";

export async function GET() {
  try {
    // Connect to MongoDB
    await connectDB();

    // Check if file exists
    if (!fs.existsSync(CSV_FILE_PATH)) {
      return NextResponse.json(
        { error: `CSV file not found at: ${CSV_FILE_PATH}` },
        { status: 404 }
      );
    }

    // Parse CSV
    const results: CSVRow[] = [];

    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(CSV_FILE_PATH)
        .pipe(csv())
        .on("data", (data: CSVRow) => results.push(data))
        .on("end", () => resolve())
        .on("error", (error: Error) => reject(error));
    });

    if (results.length === 0) {
      return NextResponse.json(
        { error: "CSV file is empty or could not be parsed" },
        { status: 400 }
      );
    }

    // Debug: Log first row to see what keys are parsed
    if (results.length > 0) {
      console.log("CSV keys found:", Object.keys(results[0]));
      console.log("First row sample:", results[0]);
    }

    // Helper function to get value by key (case-insensitive, trimmed)
    const getValue = (obj: CSVRow, key: string): string | undefined => {
      const normalizedKey = key.toLowerCase().trim();
      const foundKey = Object.keys(obj).find(
        (k) => k.toLowerCase().trim() === normalizedKey
      );
      return foundKey ? obj[foundKey] : undefined;
    };

    // Process all rows
    const processedParts: ProcessedPart[] = [];
    const errors: string[] = [];

    for (let i = 0; i < results.length; i++) {
      const item = results[i];

      try {
        // Extract required fields - mapping CSV columns to model fields
        const siyamRef = getValue(item, "siyam_ref");

        if (!siyamRef || siyamRef.trim() === "") {
          errors.push(
            `Row ${i + 2}: Missing siyam_ref. Available keys: ${Object.keys(
              item
            ).join(", ")}`
          );
          continue;
        }

        const newPart = {
          siyam_ref: siyamRef.trim(),
          radiator_type: getValue(item, "type") || "",
          make: getValue(item, "make") || "",
          model: getValue(item, "application") || "",
          oem: getValue(item, "oems")
            ? getValue(item, "oems")!
                .split(" / ")
                .filter((o: string) => o.trim())
            : [],
          category: getValue(item, "category") || "",
        };

        // Extract details (all other fields)
        const details: Detail[] = [];
        const excludeKeys = [
          "siyam_ref",
          "type",
          "make",
          "application",
          "oems",
          "category",
        ];

        Object.keys(item).forEach((key) => {
          if (!excludeKeys.includes(key.toLowerCase())) {
            const value = item[key];
            if (value && value.trim()) {
              details.push({ name: key, data: value.trim() });
            }
          }
        });

        const partData = {
          ...newPart,
          details: details,
        };

        // Check if part already exists
        const existingPart = await Part.findOne({
          siyam_ref: newPart.siyam_ref,
        });

        if (existingPart) {
          // Update existing part
          await Part.updateOne(
            { siyam_ref: newPart.siyam_ref },
            { $set: partData }
          );
          processedParts.push({
            siyam_ref: newPart.siyam_ref,
            action: "updated",
          });
        } else {
          // Create new part
          await Part.create(partData);
          processedParts.push({
            siyam_ref: newPart.siyam_ref,
            action: "created",
          });
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        errors.push(`Row ${i + 2}: ${errorMessage}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${processedParts.length} parts successfully`,
      processed: processedParts.length,
      errors: errors.length,
      errorDetails: errors.length > 0 ? errors : undefined,
      filePath: CSV_FILE_PATH,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to process CSV file";
    console.error("Upload error:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
