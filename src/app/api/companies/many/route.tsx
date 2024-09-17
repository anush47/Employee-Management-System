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

export async function GET(req: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(options);
    const user = session?.user || null;
    const userId = user?.id;

    // Validate userId
    userIdSchema.parse(userId);

    // Create filter if usertype is not admin
    const filter = user?.role === "admin" ? {} : { user: userId };

    // Connect to the database
    await dbConnect();

    // Fetch companies from the database
    const companies = await Company.find(filter).lean();

    // Add the number of employees for each company in a single batch operation
    const companyIds = companies.map((company) => company._id);

    // Get employee counts in bulk for all companies
    const employeeCounts = await Employee.aggregate([
      { $match: { company: { $in: companyIds }, active: true } },
      { $group: { _id: "$company", count: { $sum: 1 } } },
    ]);

    // Create a mapping of companyId to employee count
    const employeeCountMap = employeeCounts.reduce((acc, { _id, count }) => {
      acc[_id] = count;
      return acc;
    }, {});

    // Add employee counts to companies
    const companiesWithEmployeeCount = companies.map((company) => ({
      ...company,
      noOfEmployees: employeeCountMap[company._id as string] || 0, // Default to 0 if no employees
    }));

    // Return the response
    return NextResponse.json({ companies: companiesWithEmployeeCount });
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
