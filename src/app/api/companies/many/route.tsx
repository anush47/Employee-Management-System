import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/app/lib/db";
import { getServerSession } from "next-auth";
import Company from "@/app/models/Company";
import { options } from "../../auth/[...nextauth]/options";
import { ObjectId } from "mongodb";
import { z } from "zod";

// Define schema for validation
const userIdSchema = z.string().min(1, "User ID is required");

export async function GET(req: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(options);
    const user = session?.user || null;
    const userId = user?.id;

    // Validate userId
    userIdSchema.parse(userId);

    // Convert userId to ObjectId

    // Create filter
    const filter = { user: userId };

    // Connect to the database
    await dbConnect();

    // Fetch companies from the database
    const companies = await Company.find(filter).lean(); // Use .lean() for better performance
    console.log(companies);
    // Return the company data
    return NextResponse.json({ companies });
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
