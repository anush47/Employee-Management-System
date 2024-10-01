import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/app/lib/db";
import Employee from "@/app/models/Employee";
import { z } from "zod";
import { initialInOutProcess } from "./initialInOutProcess";

const IdSchema = z.string().min(1, "ID is required");

// POST request handler
export async function POST(req: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(options);
    const user = session?.user || null;
    const userId = user?.id;

    // Validate userId
    IdSchema.parse(userId);

    const body = await req.json();
    const { inOut } = body;
    const inOutInitial = initialInOutProcess(inOut);

    return NextResponse.json({ inOutInitial });
  } catch (error) {
    //console.error(error);
    // Handle Zod validation errors
    console.log(error);
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
