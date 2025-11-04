import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/ConnectDB";
import { Part } from "@/models/part";

// Force dynamic rendering for serverless functions
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    let query = searchParams.get("query");

    if (!query) {
      query = "";
    }

    if (query.length === 0) {
      return NextResponse.json({
        success: true,
        results: [],
        count: 0,
      });
    }

    try {
      const search = await Part.aggregate([
        {
          $search: {
            index: "parts_search",
            compound: {
              should: [
                {
                  autocomplete: {
                    query,
                    path: "siyam_ref",
                  },
                },
                {
                  autocomplete: {
                    query,
                    path: "model",
                  },
                },
                {
                  autocomplete: {
                    query,
                    path: "oem",
                  },
                },
              ],
            },
          },
        },
      ]);

      return NextResponse.json({
        success: true,
        results: search.map((result) => ({
          ...result,
          _id: result._id?.toString(),
        })),
        count: search.length,
      });
    } catch (searchError: unknown) {
      // If Atlas Search fails, fall back to regular text search
      const errorMessage =
        searchError instanceof Error
          ? searchError.message
          : String(searchError);
      console.error(
        "Atlas Search error, falling back to regex search:",
        errorMessage
      );

      const searchRegex = new RegExp(query, "i");
      const fallbackResults = await Part.find({
        $or: [
          { siyam_ref: { $regex: searchRegex } },
          { model: { $regex: searchRegex } },
          { oem: { $in: [searchRegex] } },
        ],
      })
        .limit(50)
        .lean();

      return NextResponse.json({
        success: true,
        results: fallbackResults.map((result) => ({
          ...result,
          _id: result._id?.toString(),
        })),
        count: fallbackResults.length,
      });
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to search products";
    console.error("Search API error:", error);

    // Return 500 instead of 401 to avoid confusion
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
