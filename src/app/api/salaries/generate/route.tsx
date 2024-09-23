import Company from "@/app/models/Company";
import dbConnect from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { options } from "../../auth/[...nextauth]/options";
import { z } from "zod";
import { generateSalaryForOneEmployee } from "./salaryGeneration";
import Employee from "@/app/models/Employee";
import { checkPurchased } from "../../purchases/check/route";

const IdSchema = z.string().min(1, "ID is required");
const periodSchema = z
  .string()
  .regex(/^\d{4}-\d{2}$/, "Period must be in the format YYYY-MM");

// GET request handler
export async function GET(req: NextRequest) {
  await dbConnect(); // Ensure database connection before any operations

  try {
    // Get user session
    const session = await getServerSession(options);
    const user = session?.user || null;
    const userId = user?.id;

    // Validate userId
    //IdSchema.parse(userId);

    const employeeId = req.nextUrl.searchParams.get("employeeId");
    const companyId = req.nextUrl.searchParams.get("companyId");
    const period = req.nextUrl.searchParams.get("period");

    console.log(period);
    // Validate period
    periodSchema.parse(period);

    if (user?.role !== "admin" && !companyId && !employeeId) {
      return NextResponse.json(
        { message: "Employee ID or Company ID must be provided" },
        { status: 400 }
      );
    }

    let filter: { user?: string; _id?: string } = {
      user: userId,
    };

    //remove user if admin
    if (user?.role === "admin") {
      delete filter.user;
    }

    if (companyId) {
      // Validate companyId
      IdSchema.parse(companyId);
      filter._id = companyId;

      // Find the company
      const company = await Company.findOne(filter);
      if (!company) {
        return NextResponse.json(
          { message: "Company not found" },
          { status: 404 }
        );
      }

      // Find all active employees of the company
      const employees = await Employee.find({
        company: companyId,
        active: true,
      });

      // Generate salaries for all employees
      const salaries = await Promise.all(
        employees.map(async (employee) => {
          let data;
          if (employee.otMethod !== "random") {
            data = await req.json();
          }
          return generateSalaryForOneEmployee(employee, period!, data);
        })
      );

      return NextResponse.json({ salaries });
    } else if (employeeId) {
      // Validate employeeId
      IdSchema.parse(employeeId);

      // Find the employee
      const employee = await Employee.findOne({
        _id: employeeId,
        active: true,
      });

      if (!employee) {
        return NextResponse.json(
          { message: "Employee not found" },
          { status: 404 }
        );
      }

      // Find the company of the employee
      filter._id = employee.company;
      const company = await Company.findOne(filter);
      if (!company) {
        return NextResponse.json(
          { message: "Company not found" },
          { status: 404 }
        );
      }

      // check if purchsed
      if (!employee.company || !period) {
        return NextResponse.json(
          { message: "Employee company or period is missing" },
          { status: 400 }
        );
      }
      if (
        !(
          user?.role === "admin" &&
          (company.mode === "visit" || company.mode === "aided")
        )
      ) {
        const purchasedStatus = await checkPurchased(employee.company, period);
        if (purchasedStatus !== "approved") {
          return NextResponse.json(
            { message: "Month not Purchased. Purchase is " + purchasedStatus },
            { status: 400 }
          );
        }
      }

      let data;
      if (employee.otMethod === "calc") {
        try {
          data = await req.json();
        } catch (error) {
          data = "";
        }
      }

      // Generate salary for the employee
      const salary = await generateSalaryForOneEmployee(
        employee,
        period!,
        data
      );

      return NextResponse.json({ salary });
    }

    // If neither employeeId nor companyId is provided
    return NextResponse.json(
      { message: "Employee ID or Company ID must be provided" },
      { status: 400 }
    );
  } catch (error) {
    //console.error(error);
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
