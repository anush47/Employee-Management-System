import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import dbConnect from "@/app/lib/db";
import Purchase from "@/app/models/Purchase";
import Company from "@/app/models/Company";
import { options } from "../auth/[...nextauth]/options";
import { request } from "http";
import Employee from "@/app/models/Employee";
import Salary from "@/app/models/Salary";

const noPaySchema = z.object({
  amount: z.number().min(0, "No Pay amount must be a positive number"),
  reason: z.string().optional(),
});

const otSchema = z.object({
  amount: z.number().min(0, "Overtime amount must be a positive number"),
  reason: z.string().optional(),
});

const paymentStructureSchema = z.object({
  additions: z.array(
    z.object({
      name: z.string().min(1, "Addition name is required"),
      amount: z.number().min(0, "Addition amount must be a positive number"),
    })
  ),
  deductions: z.array(
    z.object({
      name: z.string().min(1, "Deduction name is required"),
      amount: z.number().min(0, "Deduction amount must be a positive number"),
    })
  ),
});
const salarySchema = z.object({
  employee: z.string().min(1, "Employee ID is required"),
  period: z.string().min(1, "Period is required"),
  basic: z.number().min(1, "Basic salary is required"),
  noPay: noPaySchema,
  ot: otSchema,
  paymentStructure: paymentStructureSchema,
  advanceAmount: z.number().optional(), // Optional field
  finalSalary: z.number().min(0, "Final salary must be a positive number"),
});

// GET: Fetch a purchase by ID or all purchases of the company
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(options);
    const user = session?.user || null;
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }
    await dbConnect();

    //const purchaseId = req.nextUrl.searchParams.get("purchaseId");
    const companyId = req.nextUrl.searchParams.get("companyId");
    //create filter
    if (!companyId) {
      return NextResponse.json(
        { message: "Company ID is required" },
        { status: 400 }
      );
    }

    const filter: { user?: string; _id: string } = {
      user: userId,
      _id: companyId,
    };

    if (user?.role === "admin") {
      // Remove user from filter
      delete filter.user;
    }

    // Step 1: Fetch employee IDs along with name, memberNo, and nic for the specified company
    const employees: {
      _id: string;
      name: string;
      memberNo: number;
      nic: string;
    }[] = await Employee.find({ company: companyId })
      .select("_id name memberNo nic") // Fetch _id, name, memberNo, and nic fields
      .lean();

    console.log(employees);

    // Extract the list of IDs (just the _id values)
    const employeeIdList = employees.map((emp) => emp._id);

    // Step 2: Fetch salaries of employees with those IDs
    const salaries = await Salary.find({
      employee: { $in: employeeIdList }, // Match employees with the fetched IDs
    });

    // Step 3: Enrich the salary records with employee details
    const enrichedSalaries = salaries.map((salary) => {
      const employee = employees.find(
        (emp) => String(emp._id) === String(salary.employee)
      );
      return {
        ...salary._doc, // Spread the salary document data
        name: employee?.name,
        memberNo: employee?.memberNo,
        nic: employee?.nic,
      };
    });

    //send salaries
    return NextResponse.json({ salaries: enrichedSalaries });
  } catch (error: any) {
    return NextResponse.json(
      {
        message:
          error instanceof z.ZodError
            ? error.errors[0].message
            : "An unexpected error occurred",
      },
      { status: error instanceof z.ZodError ? 400 : 500 }
    );
  }
}

// POST: Create a new Salary
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(options);
    const user = session?.user || null;
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    //convert all to numbers
    body.basic = Number(body.basic);
    body.advanceAmount = Number(body.advanceAmount);
    body.finalSalary = Number(body.finalSalary);
    body.noPay.amount = Number(body.noPay.amount);
    body.ot.amount = Number(body.ot.amount);
    body.paymentStructure.additions.forEach((addition: any) => {
      addition.amount = Number(addition.amount);
    });
    body.paymentStructure.deductions.forEach((deduction: any) => {
      deduction.amount = Number(deduction.amount);
    });

    let parsedBody = salarySchema.parse(body);

    await dbConnect();

    const employee = await Employee.findById(parsedBody.employee);
    if (!employee) {
      return NextResponse.json(
        { message: "Employee not found" },
        { status: 404 }
      );
    }

    // Create filter
    const filter: { user?: string; _id: string } = {
      user: userId,
      _id: employee.company,
    };
    if (user?.role === "admin") {
      // Remove user from filter
      delete filter.user;
    }
    const company = await Company.findOne(filter);
    if (!company) {
      return NextResponse.json({ message: "Access denied." }, { status: 403 });
    }

    const existingSalary = await Salary.findOne({
      employee: parsedBody.employee,
      period: parsedBody.period,
    });
    if (existingSalary) {
      return NextResponse.json(
        { message: "Salary already exists" },
        { status: 400 }
      );
    }

    //create and save new salary
    const newSalary = new Salary({
      ...parsedBody,
    });
    await newSalary.save();

    return NextResponse.json({
      message: "Purchase created successfully",
      purchase: "",
    });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      {
        message:
          error instanceof z.ZodError
            ? error.errors[0].message
            : "An unexpected error occurred",
      },
      { status: error instanceof z.ZodError ? 400 : 500 }
    );
  }
}

//update schema
const purchaseUpdateSchema = z.object({
  _id: z.string().min(1, "Purchase ID is required"),
  approvedStatus: z.enum(["approved", "pending", "rejected"]).optional(),
  request: z.union([z.string().optional(), z.null()]),
  remark: z.string().optional(),
  totalPrice: z
    .number()
    .min(0, "Total price must be a positive number")
    .optional(),
});

// PUT: Update an existing purchase
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(options);
    const user = session?.user || null;
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    if (user.role !== "admin") {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const body = await req.json();
    const parsedBody = purchaseUpdateSchema.parse(body);
    if (parsedBody.request == "delete") {
      parsedBody.request = null;
    }
    await dbConnect();

    const existingPurchase = await Purchase.findById(parsedBody._id);
    if (!existingPurchase) {
      return NextResponse.json(
        { message: "Purchase not found" },
        { status: 404 }
      );
    }

    const company = await Company.findById(existingPurchase.company);
    if (!company) {
      return NextResponse.json({ message: "Access denied." }, { status: 403 });
    }

    const updatedPurchase = await Purchase.findByIdAndUpdate(
      parsedBody._id,
      parsedBody,
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    if (!updatedPurchase) {
      return NextResponse.json(
        { message: "Failed to update purchase" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Purchase updated successfully",
      purchase: updatedPurchase,
    });
  } catch (error: any) {
    //console.log(error);
    return NextResponse.json(
      {
        message:
          error instanceof z.ZodError
            ? error.errors[0].message
            : "An unexpected error occurred",
      },
      { status: error instanceof z.ZodError ? 400 : 500 }
    );
  }
}
