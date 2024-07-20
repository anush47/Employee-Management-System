import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/app/lib/db";
import { z } from "zod";
import Company from "@/app/models/Company";
import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/options";

// Define schema for validation
const employerNoSchema = z.string().min(1, "Employer No is required");

export async function GET(req: NextRequest) {
  try {
    // Retrieve query parameters (adjust if using a different method)
    const url = new URL(req.url);
    const employerNo = url.searchParams.get("employerNo");

    // Validate employerNo
    employerNoSchema.parse(employerNo);

    // Get user session
    const session = await getServerSession(options);
    const user = session?.user || null;
    const userId = user?.id;

    // if (!userId) {
    //   return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    // }

    // Create filter
    const filter = { employerNo, user: userId };

    // Connect to the database
    await dbConnect();

    // Fetch company from the database
    const company = await Company.findOne(filter);

    if (!company) {
      return NextResponse.json(
        { message: "Company not found" },
        { status: 404 }
      );
    }

    // Return the company data
    return NextResponse.json({ company });
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      );
    }
    // Handle general errors
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
