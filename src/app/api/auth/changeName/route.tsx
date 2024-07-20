import dbConnect from "@/app/lib/db";
import User from "@/app/models/User";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../[...nextauth]/options";
import { z } from "zod";

const nameSchema = z.string().min(1, "Name is required");

export async function POST(req: NextRequest) {
  try {
    // Get the user session
    const session = await getServerSession(options);
    if (!session) {
      return NextResponse.redirect("/auth/signin?callbackUrl=/user/settings");
    }

    // Parse and validate the input
    const json = await req.json();
    const name = nameSchema.parse(json.name);

    // Connect to the database
    await dbConnect();

    // Find and update the user
    const user = await User.findOneAndUpdate(
      { _id: session.user.id },
      { name },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    //update the session

    //remove password
    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    // Handle other errors (e.g., database errors)
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
