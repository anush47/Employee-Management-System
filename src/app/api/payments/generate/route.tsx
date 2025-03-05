import Company from "@/app/models/Company";
import dbConnect from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { options } from "../../auth/[...nextauth]/options";
import { z } from "zod";
import Employee from "@/app/models/Employee";
import { checkPurchased } from "../../purchases/check/checkPurchased";
import Salary from "@/app/models/Salary";
import { generatePayment } from "./paymentGeneration";
import Payment from "@/app/models/Payment";

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
    let { salaryIds, companyId, period, regenerate } = body;
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

    //if payment already exists, return error
    if (regenerate !== true) {
      const existingPayment = await Payment.findOne({
        company: companyId,
        period: period,
      });

      if (existingPayment) {
        return NextResponse.json(
          { message: "Payment already exists for:" + period },
          { status: 400 }
        );
      }
    }

    if (
      !(
        user?.role === "admin" &&
        (company.mode === "visit" || company.mode === "aided")
      )
    ) {
      const purchasedStatus = await checkPurchased(companyId, period);
      if (purchasedStatus !== "approved") {
        return NextResponse.json(
          {
            message: `Month not Purchased for ${period}. Purchase is ${purchasedStatus}`,
          },
          { status: 400 }
        );
      }
    }

    // find employees ids of company
    const employeeIds = await Employee.find({ company: companyId }).select(
      "_id"
    );

    // Find all salaries
    let salaries = [];
    if (salaryIds) {
      salaries = await Salary.find({
        _id: { $in: salaryIds },
      });
    } else {
      salaries = await Salary.find({
        employee: { $in: employeeIds },
        period: period,
      });
    }

    // If no salaries
    if (!salaries || salaries.length === 0) {
      return NextResponse.json(
        { message: "No salaries found for the company" },
        { status: 400 }
      );
    }

    const generatedPayment = generatePayment(company, salaries);

    return NextResponse.json({ payment: generatedPayment });
  } catch (error) {
    console.log(error);

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
