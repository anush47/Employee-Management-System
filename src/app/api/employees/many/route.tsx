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
    let companyFilter = {};
    let companies = [];

    if (user?.role === "admin") {
      // Admin can see all employees
      if (companyId === "all") {
        // Admin can see all employees of all companies
        filter = {};
        companies = await Company.find({}).select("_id name employerNo").lean();
      } else {
        // Admin can see employees of a specific company
        filter = { company: companyId };
        companyFilter = { _id: companyId };
        companies = await Company.find(companyFilter)
          .select("_id name employerNo")
          .lean();
      }
    } else if (companyId === "all") {
      // User can see all employees of their companies
      const userCompanies = await Company.find({ user: userId })
        .select("_id name employerNo")
        .lean();
      const companyIds = userCompanies.map((company) => company._id);
      filter = { company: { $in: companyIds } };
      companyFilter = { _id: { $in: companyIds } };
      companies = userCompanies;
    } else {
      // User can see employees of a specific company
      filter = { company: companyId };
      companyFilter = { user: userId, _id: companyId };
      companies = await Company.find(companyFilter)
        .select("_id name employerNo")
        .lean();
    }

    // Check if company exists without fetching data
    const companyExists = await Company.exists(companyFilter);
    if (!companyExists) {
      return NextResponse.json(
        { message: "Company not found" },
        { status: 404 }
      );
    }

    // Find employees based on the filter
    const employees = await Employee.find(filter).lean();

    // Enrich employees with company details
    const enrichedEmployees = employees.map((employee) => {
      const company = companies.find(
        (comp) => String(comp._id) === String(employee.company)
      );
      return {
        ...employee,
        companyName: company?.name,
        companyEmployerNo: company?.employerNo,
      };
    });

    // Return enriched employees
    return NextResponse.json({ employees: enrichedEmployees });
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
