import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/app/lib/db";
import { getServerSession } from "next-auth";
import Company from "@/app/models/Company";
import { options } from "../../auth/[...nextauth]/options";
import { ObjectId } from "mongodb";
import { z } from "zod";
import Employee from "@/app/models/Employee";

// Define schema for validation
const userIdSchema = z.string().min(1, "User ID is required");
const companyIdSchema = z.string().min(1, "Company ID is required");

export async function GET(req: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(options);
    const user = session?.user || null;
    const userId = user?.id;

    // Validate userId
    userIdSchema.parse(userId);

    //get the companyId from url
    const companyId = req.nextUrl.searchParams.get("companyId");
    // Validate companyId
    companyIdSchema.parse(companyId);

    // Create filter
    const filter = { user: userId, _id: companyId };
    if (user?.role === "admin") {
      // Remove user from filter
      delete filter.user;
    }

    // Connect to the database
    await dbConnect();

    //check if company exists without fetching data
    const companyExists = await Company.exists(filter);
    if (!companyExists) {
      return NextResponse.json(
        { message: "Company not found" },
        { status: 404 }
      );
    }
    //find employees with company as company ID
    const employees = await Employee.find({ company: companyId });

    //return employees
    return NextResponse.json({ employees });
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
