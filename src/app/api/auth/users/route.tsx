import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth"; // Adjust import as needed
import { z } from "zod";
import dbConnect from "@/app/lib/db";
import User from "@/app/models/User"; // Assuming a User model exists
import { options } from "../[...nextauth]/options";

// Define schema for validation
const userIdSchema = z.string().min(1, "User ID is required");

export async function GET(req: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(options);
    const user = session?.user || null;

    // Check if the user is an admin or authorized to fetch the user
    const userId = req.nextUrl.searchParams.get("user");
    if (!user || (user.role !== "admin" && user.id !== userId)) {
      return NextResponse.json(
        { message: "Unauthorized access" },
        { status: 403 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    // Validate the userId
    userIdSchema.parse(userId);

    // Connect to the database
    await dbConnect();

    // Fetch the user from the database using the userId
    const fetchedUser = await User.findById(userId).lean(); // Use .lean() for better performance
    if (!fetchedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Return the user data
    return NextResponse.json({ user: fetchedUser });
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
