import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/app/lib/db";
import { getServerSession } from "next-auth";
import Company from "@/app/models/Company";
import Employee from "@/app/models/Employee"; // Assuming you have an Employee model
import { options } from "../../auth/[...nextauth]/options";
import { z } from "zod";

// Define the schema for employee validation
export const employeeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  memberNo: z.number().min(1, "Member number is required"),
  nic: z.string().min(1, "NIC is required"),
  basic: z.number().min(1, "Basic salary is required"),
  divideBy: z.union([z.literal(240), z.literal(200)]).default(240),
  designation: z.string().optional(),
  otMethod: z.string(),
  startedAt: z.string().optional(),
  active: z.boolean().default(true),
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

// Define the schema as shown earlier

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
    //change memberNo to int
    body.memberNo = parseInt(body.memberNo);
    console.log(body);
    const parsedBody = employeeSchema.parse(body);
    //print
    console.log(parsedBody);

    // Connect to the database
    await dbConnect();

    // Find the company by ID to ensure it exists and belongs to the user
    const company = await Company.findById(parsedBody.company);
    if (!company || company.user.toString() !== userId) {
      return NextResponse.json(
        { message: "Access denied. You cannot add employees to this company." },
        { status: 403 }
      );
    }

    //check employees in company to see if member no exists
    const employees = await Employee.find({
      company: parsedBody.company,
    });
    for (let i = 0; i < employees.length; i++) {
      if (employees[i].memberNo === parsedBody.memberNo) {
        return NextResponse.json(
          { message: "Employee with this member number already exists" },
          { status: 400 }
        );
      }
    }

    // Create new employee
    const newEmployee = new Employee({
      ...parsedBody,
      user: userId,
    });

    // Save the new employee to the database
    await newEmployee.save();

    // Return success response
    return NextResponse.json({ message: "Employee added successfully" });
  } catch (error) {
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
