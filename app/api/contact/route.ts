import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/ConnectDB";
import { Contact } from "@/models/contact";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body. Please provide valid JSON data.",
        },
        { status: 400 }
      );
    }

    const { name, company, email, phone, siyam_ref } = body || {};

    // Create new contact - trim values and handle optional fields
    const contact = new Contact({
      name: name.trim() || "",
      company: company?.trim() || undefined,
      email: email.trim() || "",
      phone: phone?.trim() || undefined,
      siyam_ref: siyam_ref?.trim() || undefined,
    });

    await contact.save();

    return NextResponse.json(
      {
        success: true,
        message: "Contact information saved successfully",
        contact: {
          id: contact._id.toString(),
          name: contact.name,
          company: contact.company,
          email: contact.email,
          phone: contact.phone,
          siyam_ref: contact.siyam_ref,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to save contact";
    console.error("API error:", error);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
