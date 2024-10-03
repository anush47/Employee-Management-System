import Company from "@/app/models/Company";
import dbConnect from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { options } from "../../auth/[...nextauth]/options";
import { z } from "zod";
import { generateSalaryForOneEmployee } from "./salaryGeneration";
import Employee from "@/app/models/Employee";
import { checkPurchased } from "../../purchases/check/checkPurchased";
import Salary from "@/app/models/Salary";
import { initialInOutProcess } from "../initialInOutProcess";

const IdSchema = z.string().min(1, "ID is required");
const periodSchema = z
  .string()
  .regex(/^\d{4}-\d{2}$/, "Period must be in the format YYYY-MM");

// POST request handler
export async function POST(req: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(options);
    const user = session?.user || null;
    const userId = user?.id;

    // Validate userId
    IdSchema.parse(userId);

    const body = await req.json();
    let { employees, companyId, period, inOut } = body;

    // Validate period
    periodSchema.parse(period);
    IdSchema.parse(companyId);

    if (!companyId) {
      return NextResponse.json(
        { message: "Company ID must be provided" },
        { status: 400 }
      );
    }

    let filter: { user?: string; _id?: string } = {
      user: userId,
      _id: companyId,
    };

    if (user?.role === "admin") {
      delete filter.user;
    }

    await dbConnect(); // Ensure database connection before any operations

    const company = await Company.findOne(filter);

    if (!company) {
      return NextResponse.json(
        { message: "Company not found" },
        { status: 400 }
      );
    }

    if (
      !(
        user?.role === "admin" &&
        (company.mode === "visit" || company.mode === "aided")
      )
    ) {
      const purchasedStatus = await checkPurchased(companyId, period);
      if (purchasedStatus !== "approved") {
        console.log("huttak");
        return NextResponse.json(
          {
            message: `Month not Purchased for ${period} .Purchase is ${purchasedStatus}`,
          },
          { status: 400 }
        );
      }
    }

    // Find all active employees of the company if employees are not given
    if (!employees) {
      employees = await Employee.find({
        company: companyId,
        active: true,
      });
    } else {
      //get employees from employees
      employees = await Employee.find({
        _id: { $in: employees },
        company: companyId,
        //active: true, //allow inactive employees
      });
    }

    //if no employees
    if (!employees || employees?.length === 0) {
      return NextResponse.json(
        { message: "No active employees found for the company" },
        { status: 400 }
      );
    }

    // Generate salary for all employees
    const salaries = [];

    const exists = [];

    const inOutInitial = initialInOutProcess(inOut);
    for (const employee of employees) {
      const existingSalary = await Salary.findOne({
        employee: employee._id,
        period: period,
      });
      if (existingSalary) {
        console.log(
          `Salary already exists for employee ${employee.name} for period ${period}`
        );
        exists.push(employee._id);
        continue; // Skip this employee and continue with the next one
      }

      const salary = await generateSalaryForOneEmployee(
        employee,
        period,
        inOutInitial[employee._id] ? inOutInitial[employee._id] : undefined
      );
      salaries.push(salary);
    }

    return NextResponse.json({ salaries, exists });
  } catch (error) {
    //console.error(error);
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
