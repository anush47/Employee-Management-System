import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/app/lib/db";
import { getServerSession } from "next-auth";
import Company from "@/app/models/Company";
import { options } from "../../auth/[...nextauth]/options";
import { z } from "zod";
import { calculateMonthlyPrice } from "../../purchases/price/priceUtils";

// Define schema for validation
const companySchema = z.object({
  name: z.string().min(1, "Name is required"),
  employerNo: z
    .string()
    .min(1, "Employer Number is required")
    .regex(/^[A-Z]\/\d{5}$/, "Employer Number must match the pattern A/12345"),
  address: z.string().optional(),
  startedAt: z.string().optional(),
  paymentMethod: z.string().optional(),
  monthlyPrice: z.number(),
  monthlyPriceOverride: z.boolean(),
  requiredDocs: z.object({
    epf: z.boolean(),
    etf: z.boolean(),
    salary: z.boolean(),
    paySlip: z.boolean(),
  }),
  workingDays: z.object({
    mon: z.string().optional(),
    tue: z.string().optional(),
    wed: z.string().optional(),
    thu: z.string().optional(),
    fri: z.string().optional(),
    sat: z.string().optional(),
    sun: z.string().optional(),
  }),
  active: z.boolean().default(true),
  employerName: z.string().optional(),
  employerAddress: z.string().optional(),
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
    //setMonthlyPrice
    body.monthlyPrice = calculateMonthlyPrice(null, 0, 0);
    body.monthlyPriceOverride = false;
    body.workingDays = {
      mon: "full",
      tue: "full",
      wed: "full",
      thu: "full",
      fri: "full",
      sat: "half",
      sun: "off",
    };
    body.requiredDocs = {
      epf: true,
      etf: true,
      salary: true,
      paySlip: true,
    };
    const parsedBody = companySchema.parse(body);

    // Connect to the database
    await dbConnect();

    // Create new company
    const newCompany = new Company({
      ...parsedBody,
      user: userId,
    });

    // Save the new company to the database
    await newCompany.save();

    // Return success response
    return NextResponse.json({ message: "Company added successfully" });
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      );
    }

    //duplicate error
    if ((error as any).code === 11000) {
      return NextResponse.json(
        { message: "Company with this Employer Number already exists" },
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
