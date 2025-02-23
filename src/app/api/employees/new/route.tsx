import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/app/lib/db";
import { getServerSession } from "next-auth";
import Company from "@/app/models/Company";
import Employee from "@/app/models/Employee"; // Assuming you have an Employee model
import { options } from "../../auth/[...nextauth]/options";
import { z } from "zod";
import { calculateMonthlyPrice } from "../../purchases/price/priceUtils";

// Define the schema for employee validation
const employeeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  memberNo: z.number().min(1, "Member number is required"),
  nic: z
    .string()
    .regex(
      /^(?:[0-9]{9}[vVxX]|[0-9]{12})$/,
      "NIC must be a valid format (e.g., 123456789V or 123456789012)"
    ),
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
        affectTotalEarnings: z.boolean().optional(),
      })
    ),
    deductions: z.array(
      z.object({
        name: z.string(),
        amount: z.union([z.string(), z.number(), z.null()]),
        affectTotalEarnings: z.boolean().optional(),
      })
    ),
  }),
  company: z.string().length(24, "Company ID must be a valid ObjectId"),
  phoneNumber: z
    .string()
    .regex(/^\d{10}$/, "Phone number must be a valid 10")
    .optional(),
  email: z.string().email("Email must be a valid email").optional(),
  address: z.string().optional(), // Add this line
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
    //trim name and nic
    body.name = body.name.trim();
    body.nic = body.nic.trim();
    //capitalize nic and name
    body.name = body.name.toUpperCase();
    body.nic = body.nic.toUpperCase();

    // Convert to int
    body.memberNo = parseInt(body.memberNo);
    body.basic = parseFloat(body.basic);
    //email phone number and address if ""
    if (body.email === "") {
      delete body.email;
    }
    if (body.phoneNumber === "") {
      delete body.phoneNumber;
    }
    if (body.address === "") {
      delete body.address;
    }
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

    // Check if the company is in visit mode or aided mode if not an admin
    if (
      user?.role !== "admin" &&
      (company.mode === "aided" || company.mode === "visit")
    ) {
      return NextResponse.json(
        {
          message: "You are not allowed to add employees to this company",
        },
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
    // Count the total and active employees in the company
    if (!company?.monthlyPriceOverride) {
      const [employeeCount, activeEmployeeCount] = await Promise.all([
        Employee.countDocuments({ company: parsedBody.company }),
        Employee.countDocuments({ company: parsedBody.company, active: true }),
      ]);
      const price = calculateMonthlyPrice(
        company,
        employeeCount,
        activeEmployeeCount
      );
      if (price !== company.monthlyPrice) {
        // Update the company's monthly price if it has changed
        company.monthlyPrice = price;
        await company.save();
      }
    }

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
