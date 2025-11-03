import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/ConnectDB";
import { Part } from "@/models/part";

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
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to search products";
    console.error("Search API error:", error);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
