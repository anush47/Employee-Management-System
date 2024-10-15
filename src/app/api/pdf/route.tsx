import { NextRequest, NextResponse } from "next/server";
import { getData, getPDFOutput, mergePdfs, setupData } from "./helpers";
import { getETFDoc } from "./etf";
import { getSalaryDoc } from "./salary";
import { getEPFDoc } from "./epf";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { options } from "../auth/[...nextauth]/options";
import dbConnect from "@/app/lib/db";
import Company from "@/app/models/Company";
import { checkPurchased } from "../purchases/check/checkPurchased";

const periodSchema = z
  .string()
  .regex(/^\d{4}-\d{2}$/, { message: "Period must be in the format yyyy-mm" });
const pdfTypeSchema = z.union([
  z.literal("etf"),
  z.literal("salary"),
  z.literal("epf"),
  z.literal("payslip"),
  z.literal("all"),
  z.literal("print"),
]);
const salaryIdsschema = z.array(z.string());

// GET request handler
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
    //get details from body
    const body = await req.json();
    let { companyId, period, salaryIds, pdfType } = body;

    period = periodSchema.parse(period);
    salaryIds = salaryIds ? salaryIdsschema.parse(salaryIds) : undefined;
    pdfType = pdfTypeSchema.parse(pdfType);

    if (!companyId || !period || !pdfType) {
      return NextResponse.json({ message: "Invalid reqest" }, { status: 400 });
    }

    await dbConnect();

    //check authority
    const filter: { user?: string; _id: string } = {
      user: userId,
      _id: companyId,
    };
    //if admin allow
    if (user?.role === "admin") {
      delete filter.user;
    }
    //check if companyExists without fetching
    const companyCheck = await Company.findOne(filter).select("mode name");
    if (!companyCheck) {
      return NextResponse.json({ message: "Access denied." }, { status: 404 });
    }

    //check purchased
    if (
      !(
        user?.role === "admin" &&
        (companyCheck.mode === "visit" || companyCheck.mode === "aided")
      )
    ) {
      const purchasedStatus = await checkPurchased(companyId, period);
      if (purchasedStatus !== "approved") {
        return NextResponse.json(
          {
            message: `${period} not Purchased for ${companyCheck.name}. Purchase is ${purchasedStatus}`,
          },
          { status: 400 }
        );
      }
    }

    const neepPayment = pdfType !== "salary";

    const { company, salaries, payment } = await getData(
      companyId,
      period,
      neepPayment,
      salaryIds
    );
    //const salaries1 = Array.from({ length: 20 }, () => salaries[0]);

    //if no salaries found
    if (salaries.length === 0) {
      return NextResponse.json(
        { message: `Salary data not found for ${company.name} for ${period}` },
        { status: 404 }
      );
    }

    if (neepPayment && (!payment || Object.keys(payment).length === 0)) {
      return NextResponse.json(
        {
          message: `Payment data not found for ${company.name} for ${period}`,
        },
        { status: 404 }
      );
    }

    const { columns, data } = setupData(salaries);

    const pdfOutput = await getPDFOutput(
      company,
      period,
      columns,
      data,
      payment,
      pdfType
    );

    if (!pdfOutput) {
      return NextResponse.json({ message: "Invalid reqest" }, { status: 400 });
    }

    // Return the PDF as a response
    return new NextResponse(pdfOutput, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="report.pdf"', // or "attachment" if you want it to be downloaded
      },
    });
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
