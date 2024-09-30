import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/app/lib/db";
import { getServerSession } from "next-auth";
import Company from "@/app/models/Company";
import Employee from "@/app/models/Employee"; // Assuming you have an Employee model
import { options } from "../../auth/[...nextauth]/options";
import { z } from "zod";

// Define the schema for employee validation
const employeeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  memberNo: z.number().min(1, "Member number is required"),
  nic: z.string().min(1, "NIC is required"),
  basic: z.number().min(1, "Basic salary is required"),
  totalSalary: z.union([z.string(), z.number(), z.null()]),
  divideBy: z.union([z.literal(240), z.literal(200)]).default(240),
  designation: z.string().optional(),
  remark: z.string().optional(),
  otMethod: z.string(),
  startedAt: z.string().optional(),
  active: z.boolean().default(true),
  workingDays: z.object({
    mon: z.string().optional(),
    tue: z.string().optional(),
    wed: z.string().optional(),
    thu: z.string().optional(),
    fri: z.string().optional(),
    sat: z.string().optional(),
    sun: z.string().optional(),
  }),
  shifts: z.array(
    z.object({
      start: z.string().min(1, "Start time is required"),
      end: z.string().min(1, "End time is required"),
    })
  ),
  paymentStructure: z.object({
    additions: z.array(
      z.object({
        name: z.string(),
        amount: z.union([z.string(), z.number(), z.null()]),
      })
    ),
    deductions: z.array(
      z.object({
        name: z.string(),
        amount: z.union([z.string(), z.number(), z.null()]),
      })
    ),
  }),
  company: z.string().length(24, "Company ID must be a valid ObjectId"),
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
    // Convert memberNo to int
    body.memberNo = parseInt(body.memberNo);
    const parsedBody = employeeSchema.parse(body);

    // Connect to the database
    await dbConnect();

    // Create filter
    const filter: { user?: string; _id: string } = {
      user: userId,
      _id: parsedBody.company,
    };
    if (user?.role === "admin") {
      // Remove user from filter
      delete filter.user;
    }

    // Find the company by ID to ensure it exists and belongs to the user
    const company = await Company.findById(parsedBody.company);
    if (!company) {
      return NextResponse.json(
        { message: "Access denied. You cannot add employees to this company." },
        { status: 403 }
      );
    }

    // Check if the memberNo already exists within the company
    const employees = await Employee.find({ company: parsedBody.company });
    for (let i = 0; i < employees.length; i++) {
      if (employees[i].memberNo === parsedBody.memberNo) {
        return NextResponse.json(
          { message: "Employee with this member number already exists" },
          { status: 400 }
        );
      }
    }

    // Create and save the new employee
    const newEmployee = new Employee({
      ...parsedBody,
      user: company.user,
    });
    await newEmployee.save();

    // Count the number of employees in the company
    const employeeCount = await Employee.countDocuments({
      company: parsedBody.company,
    });

    // Update the company's monthlyPrice based on employee count ranges
    if (employeeCount <= 5) {
      company.monthlyPrice = 3000; // Price for 0-5 employees
    } else if (employeeCount > 5 && employeeCount <= 10) {
      company.monthlyPrice = 5000; // Price for 6-10 employees
    } else {
      company.monthlyPrice = 7000; // Price for 11+ employees
    }
    // Save the updated company data
    await company.save();

    // Return success response
    return NextResponse.json({ message: "Employee added successfully" });
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
