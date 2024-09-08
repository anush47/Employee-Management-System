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

    // Get the companyId from URL
    const companyId = req.nextUrl.searchParams.get("companyId");
    // Validate companyId
    companyIdSchema.parse(companyId);

    // Connect to the database
    await dbConnect();

    let filter = {};

    if (user?.role === "admin") {
      // Admin can see all employees
      filter = {};
    } else if (companyId === "all") {
      // User can see all employees of their companies
      const userCompanies = await Company.find({ user: userId }).select("_id");
      const companyIds = userCompanies.map((company) => company._id);
      filter = { company: { $in: companyIds } };
    } else {
      // User can see employees of a specific company
      filter = { user: userId, company: companyId };
    }

    // Check if company exists without fetching data
    const companyExists = await Company.exists(filter);
    if (!companyExists) {
      return NextResponse.json(
        { message: "Company not found" },
        { status: 404 }
      );
    }

    // Find employees based on the filter
    const employees = await Employee.find(filter);

    // Return employees
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
