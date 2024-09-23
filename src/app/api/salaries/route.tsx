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
import { checkPurchased } from "../purchases/check/route";

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
  id: z.string().optional(),
  employee: z.string().min(1, "Employee ID is required"),
  period: z.string().min(1, "Period is required"),
  basic: z.number().min(1, "Basic salary is required"),
  noPay: noPaySchema,
  ot: otSchema,
  paymentStructure: paymentStructureSchema,
  inOut: z.string().optional(),
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

    const salaryId = req.nextUrl.searchParams.get("salaryId");
    let companyId = req.nextUrl.searchParams.get("companyId");
    //create filter
    if (!companyId && !salaryId) {
      return NextResponse.json(
        { message: "Company ID or salary ID is required" },
        { status: 400 }
      );
    }

    if (salaryId) {
      //fetch one
      const salary = await Salary.findById(salaryId);
      if (!salary) {
        return NextResponse.json(
          { message: "Salary not found" },
          { status: 404 }
        );
      }
      //get company from employeeId and add company id
      const employee = await Employee.findById(salary.employee);
      companyId = employee?.company;
      const filter: {
        user?: string;
        _id: string;
      } = {
        user: userId,
        _id: companyId as string,
      };
      if (user?.role === "admin") {
        delete filter.user;
      }
      const company = await Company.findOne(filter);
      if (!company) {
        return NextResponse.json(
          { message: "Access denied." },
          { status: 403 }
        );
      }
      //enriched salary
      const enrichedSalary = {
        ...salary._doc,
        name: employee?.name,
        memberNo: employee?.memberNo,
        nic: employee?.nic,
        companyName: company.name,
        companyEmployerNo: company.employerNo,
      };
      console.log(enrichedSalary);
      return NextResponse.json({ salary: enrichedSalary });
    }

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

    const company = await Company.findOne(filter);
    if (!company) {
      return NextResponse.json({ message: "Access denied." }, { status: 403 });
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

    // Extract the list of IDs (just the _id values)
    const employeeIdList = employees.map((emp) => emp._id);

    // Step 2: Fetch salaries of employees with those IDs and remove inout

    const salaries = await Salary.find(
      { employee: { $in: employeeIdList } }, // Match employees with the fetched IDs
      { inOut: 0 } // Exclude the inOut field
    );

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

    //check if purchased
    if (
      !(
        user?.role === "admin" &&
        (company.mode === "visit" || company.mode === "aided")
      )
    ) {
      const purchasedStatus = await checkPurchased(
        employee.company,
        parsedBody.period
      );
      if (purchasedStatus !== "approved") {
        return NextResponse.json(
          { message: "Month not Purchased. Purchase is " + purchasedStatus },
          { status: 400 }
        );
      }
    }

    // Calculate total additions
    const totalAdditions = parsedBody.paymentStructure.additions.reduce(
      (total: number, addition: { amount: number }) => total + addition.amount,
      0
    );

    // Calculate total deductions
    const totalDeductions = parsedBody.paymentStructure.deductions.reduce(
      (total: number, deduction: { amount: number }) =>
        total + deduction.amount,
      0
    );

    // Calculate final salary
    const finalSalary =
      parsedBody.basic +
      totalAdditions +
      (parsedBody.ot.amount || 0) -
      totalDeductions -
      (parsedBody.noPay.amount || 0);
    // Update the parsedBody with the calculated final salary
    parsedBody.finalSalary = finalSalary;

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

// PUT: Update an existing salary
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

    // parse the request body
    const body = await req.json();
    //convert to numbers
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
    console.log(body);
    const parsedBody = salarySchema.parse(body);

    // Calculate total additions
    const totalAdditions = parsedBody.paymentStructure.additions.reduce(
      (total: number, addition: { amount: number }) => total + addition.amount,
      0
    );

    // Calculate total deductions
    const totalDeductions = parsedBody.paymentStructure.deductions.reduce(
      (total: number, deduction: { amount: number }) =>
        total + deduction.amount,
      0
    );

    // Calculate final salary
    const finalSalary =
      parsedBody.basic +
      totalAdditions +
      (parsedBody.ot.amount || 0) -
      totalDeductions -
      (parsedBody.noPay.amount || 0);
    // Update the parsedBody with the calculated final salary
    parsedBody.finalSalary = finalSalary;

    await dbConnect();

    //get employee.company from employee
    const employee = await Employee.findById(parsedBody.employee).select(
      "company"
    );

    let filter: { user?: string; _id: string } = {
      user: userId,
      _id: employee.company,
    };

    if (user.role === "admin") {
      delete filter.user;
    }

    const company = await Company.findOne(filter);
    if (!company) {
      return NextResponse.json({ message: "Access denied." }, { status: 403 });
    }

    console.log(parsedBody);
    const existingSalary = await Salary.findById(parsedBody.id);
    if (!existingSalary) {
      return NextResponse.json(
        { message: "Salary not found" },
        { status: 404 }
      );
    }

    const updatedPurchase = await Salary.findByIdAndUpdate(
      parsedBody.id,
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

// DELETE: Delete an existing salary
export async function DELETE(req: NextRequest) {
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

    const salaryId = req.nextUrl.searchParams.get("salaryId");
    const companyId = req.nextUrl.searchParams.get("companyId");
    const period = req.nextUrl.searchParams.get("period");
    if (!salaryId && !companyId && !period) {
      return NextResponse.json({ message: "ID is required" }, { status: 400 });
    }

    //if salaryId
    if (salaryId) {
      await dbConnect();
      const salary = await Salary.findById(salaryId);
      if (!salary) {
        return NextResponse.json(
          { message: "Salary not found" },
          { status: 404 }
        );
      }

      //get employee.company from employee
      const employee = await Employee.findById(salary.employee).select(
        "company"
      );
      if (!employee) {
        return NextResponse.json(
          { message: "Employee not found" },
          { status: 404 }
        );
      }
      //check if user is the owner of the company
      let filter: { user?: string; _id: string } = {
        user: userId,
        _id: employee.company,
      };
      if (user.role === "admin") {
        delete filter.user;
      }
      const company = await Company.findOne(filter);
      if (!company) {
        return NextResponse.json(
          { message: "Access denied." },
          { status: 403 }
        );
      }
      await Salary.findByIdAndDelete(salaryId);
      return NextResponse.json(
        { message: "Salary deleted successfully" },
        { status: 200 }
      );
    } else if (companyId && period) {
      await dbConnect();
      // Create filter
      const filter: { user?: string; _id: string } = {
        user: userId,
        _id: companyId,
      };
      if (user?.role === "admin") {
        // Remove user from filter
        delete filter.user;
      }
      const company = await Company.findOne(filter);
      if (!company) {
        return NextResponse.json(
          { message: "Access denied." },
          { status: 403 }
        );
      }

      //find employee ids of that company
      const employees = await Employee.find({ company: companyId }).select(
        "_id"
      );
      const employeeIds = employees.map((employee) => employee._id);
      //delete all salaries of that company of that period
      await Salary.deleteMany({
        employee: { $in: employeeIds },
        period: period,
      });
      return NextResponse.json(
        { message: "Salaries deleted successfully" },
        { status: 200 }
      );
    }

    const salary = await Salary.findById(salaryId);
    if (!salary) {
      return NextResponse.json(
        { message: "Salary not found" },
        { status: 404 }
      );
    }

    await Salary.findByIdAndDelete(salaryId);

    return NextResponse.json(
      { message: "Salary deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting salary:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
