import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/ConnectDB";
import { Part } from "@/models/part";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const query: Record<string, any> = {};
    
    if (category) {
      // Match category case-insensitively and handle variations
      query.category = { $regex: new RegExp(`^${category}$`, "i") };
    }

    if (search) {
      // Search across multiple fields
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { siyam_ref: { $regex: searchRegex } },
        { make: { $regex: searchRegex } },
        { model: { $regex: searchRegex } },
        { radiator_type: { $regex: searchRegex } },
        { oem: { $in: [searchRegex] } },
      ];
    }

    const products = await Part.find(query).sort({ siyam_ref: 1 }).lean();

    return NextResponse.json({
      success: true,
      products: products.map((product) => ({
        ...product,
        _id: product._id?.toString(),
      })),
      count: products.length,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch products";
    console.error("API error:", error);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

