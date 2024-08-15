import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/app/lib/db";
import { getServerSession } from "next-auth";
import Company from "@/app/models/Company";
import { options } from "../../auth/[...nextauth]/options";
import { z } from "zod";

// Define schema for validation
const companySchema = z.object({
  name: z.string().min(1, "Name is required"),
  employerNo: z
    .string()
    .min(1, "Employer Number is required")
    .regex(/^[A-Z]\/\d{5}$/, "Employer Number must match the pattern A/12345"),
  address: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(options);
    const user = session?.user || null;
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    // Parse and validate the request body
    const body = await req.json();
    const parsedBody = companySchema.parse(body);

    // Connect to the database
    await dbConnect();

    // Create new company
    const newCompany = new Company({
      ...parsedBody,
      user: userId,
    });

    // Save the new company to the database
    await newCompany.save();

    // Return success response
    return NextResponse.json({ message: "Company added successfully" });
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      );
    }

    //duplicate error
    if ((error as any).code === 11000) {
      return NextResponse.json(
        { message: "Company with this Employer Number already exists" },
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
