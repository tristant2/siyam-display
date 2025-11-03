import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/ConnectDB";
import { Contact } from "@/models/contact";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, company, email, phone, siyam_ref } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Create new contact
    const contact = new Contact({
      name,
      company: company || undefined,
      email,
      phone: phone || undefined,
      siyam_ref: siyam_ref || undefined,
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
