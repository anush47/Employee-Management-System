import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import dbConnect from "@/app/lib/db";
import Company from "@/app/models/Company";
import { options } from "../auth/[...nextauth]/options";
import { checkPurchased } from "../purchases/check/checkPurchased";
import Payment from "@/app/models/Payment";
import Holiday from "@/app/models/Holiday";
import { getHolidays } from "./holidayHelper";

const daySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: "Day must be in the format yyyy-mm-dd",
});

// GET: Holiday
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
    const startDate = req.nextUrl.searchParams.get("startDate");
    const endDate = req.nextUrl.searchParams.get("endDate");

    if (!startDate || !endDate) {
      return NextResponse.json(
        { message: "Start and End day is required" },
        { status: 400 }
      );
    }
    daySchema.parse(startDate);
    daySchema.parse(endDate);

    const holidayResponse = await getHolidays(startDate, endDate);
    if (!holidayResponse.holidays && holidayResponse.messege) {
      return NextResponse.json(holidayResponse, { status: 400 });
    }

    // Send salaries
    return NextResponse.json({ holidays: holidayResponse.holidays });
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

const paymentSaveSchema = z.object({
  _id: z.string().optional(),
  company: z.string(),
  period: z.string(),
  epfReferenceNo: z.string().optional(),
  epfAmount: z.number().gt(0, { message: "EPF amount must be above 0" }),
  epfSurcharges: z.number().optional(),
  epfPaymentMethod: z.string().optional(),
  epfChequeNo: z.string().optional(),
  epfPayDay: z.string().optional(),
  etfAmount: z.number().gt(0, { message: "ETF amount must be above 0" }),
  etfSurcharges: z.number().optional(),
  etfPaymentMethod: z.string().optional(),
  etfChequeNo: z.string().optional(),
  etfPayDay: z.string().optional(),
  remark: z.string().optional(),
});
// POST: Create new payments
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

    // Parse the request body
    const body = await req.json();

    const payment = paymentSaveSchema.parse(body.payment);
    //remove id
    delete payment._id;

    if (!payment) {
      return NextResponse.json({ message: "Payment invalid" }, { status: 400 });
    }

    await dbConnect();

    //check if payment already exists
    const existingPayment = await Payment.findOne({
      company: payment.company,
      period: payment.period,
    });
    if (existingPayment) {
      return NextResponse.json(
        { message: "Payment already exists" },
        { status: 400 }
      );
    }

    // Check for company access and purchased status
    const filter: { user?: string; _id: string } = {
      user: userId,
      _id: payment.company,
    };
    if (user?.role === "admin") {
      delete filter.user;
    }

    // save payment
    // const newPayment = new Payment(payment);
    // await newPayment.save();

    return NextResponse.json({
      message: "Payment created successfully",
      payment: "newPayment",
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

// PUT: Update an existing payment
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
    const payment = body.payment;
    //if not payment
    if (!payment) {
      return NextResponse.json({ message: "Payment invalid" }, { status: 400 });
    }

    const parsedBody = paymentSaveSchema.parse(payment);

    await dbConnect();

    let filter: { user?: string; _id: string } = {
      user: userId,
      _id: parsedBody.company,
    };

    if (user.role === "admin") {
      delete filter.user;
    }

    const company = await Company.findOne(filter);
    if (!company) {
      return NextResponse.json({ message: "Access denied." }, { status: 403 });
    }

    const existingPayment = await Payment.findById(parsedBody._id);
    if (!existingPayment) {
      return NextResponse.json(
        { message: "Payment not found" },
        { status: 404 }
      );
    }

    const updatedPayment = await Payment.findByIdAndUpdate(
      parsedBody._id,
      parsedBody,
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    if (!updatedPayment) {
      return NextResponse.json(
        { message: "Failed to update payment" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Payment updated successfully",
      payment: updatedPayment,
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

// DELETE: Delete existing salaries
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

    const { paymentIds } = await req.json();
    if (!Array.isArray(paymentIds) || paymentIds.length === 0) {
      return NextResponse.json(
        { message: "Array of payment IDs is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    //check authority
    const payments = await Payment.find({ _id: { $in: paymentIds } }).lean();
    const companyIds = payments.map((payment) => payment.company);

    let filter: { user?: string; _id: { $in: string[] } } = {
      user: userId,
      _id: { $in: companyIds },
    };
    if (user.role === "admin") {
      delete filter.user;
    }

    //check
    const companies = await Company.find(filter).select("_id name").lean();
    //if no company
    if (companies.length === 0) {
      return NextResponse.json({ message: "Access denied." }, { status: 403 });
    }
    if (companies.length !== companyIds.length) {
      return NextResponse.json({ message: "Access denied." }, { status: 403 });
    }
    //delete
    await Payment.deleteMany({ _id: { $in: paymentIds } });
    return NextResponse.json(
      { message: "Payments deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting salaries:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}