import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/app/lib/db";
import { getServerSession } from "next-auth";
import Company from "@/app/models/Company";
import { options } from "../../auth/[...nextauth]/options";
import { z } from "zod";

// Define schema for validation
const userIdSchema = z.string().min(1, "User ID is required");
const companyIdSchema = z.string().min(1, "Company ID is required");

export async function GET(req: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(options);
    const user = session?.user || null;
    const userId = user?.id;

    // Validate userId
    userIdSchema.parse(userId);

    //get the companyId from url
    const companyId = req.nextUrl.searchParams.get("companyId");
    // Validate companyId
    companyIdSchema.parse(companyId);

    // Create filter
    const filter = { user: userId, _id: companyId };
    if (user?.role === "admin") {
      // Remove user from filter
      delete filter.user;
    }

    // Connect to the database
    await dbConnect();

    // Fetch companies from the database
    const company = await Company.findOne(filter).lean(); // Use .lean() for better performance
    // Return the company data
    return NextResponse.json({ company });
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

// Define schema for company update
const companyUpdateSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  employerNo: z.string().min(1, "Employer number is required"),
  address: z.string().optional(),
  paymentMethod: z.string().optional(),
  startedAt: z.string().optional(),
  endedAt: z.string().optional(),
  monthlyPrice: z.number().optional(),
  active: z.boolean().optional(),
  employerName: z.string().optional(),
  employerAddress: z.string().optional(),
  requiredDocs: z.object({
    epf: z.boolean().optional(),
    etf: z.boolean().optional(),
    salary: z.boolean().optional(),
    paySlip: z.boolean().optional(),
  }),
  mode: z.string().optional(),
  workingDays: z
    .object({
      mon: z.string().optional(),
      tue: z.string().optional(),
      wed: z.string().optional(),
      thu: z.string().optional(),
      fri: z.string().optional(),
      sat: z.string().optional(),
      sun: z.string().optional(),
    })
    .optional(),
});

export async function PUT(req: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(options);
    const user = session?.user || null;
    const userId = user?.id;

    // Validate userId
    userIdSchema.parse(userId);

    // Parse request body
    const body = await req.json();
    const companyId = body.id;
    const companyData = body;

    // Validate companyId
    companyIdSchema.parse(companyId);

    //parse price
    if (companyData.monthlyPrice) {
      companyData.monthlyPrice = parseInt(companyData.monthlyPrice);
    }

    // Validate companyData
    companyUpdateSchema.parse(companyData);

    // Create filter
    const filter = { user: userId, _id: companyId };

    if (user?.role === "admin") {
      delete filter.user;
    } else {
      //if mode is aided or visit dont allow modification
      if (companyData.mode === "aided" || companyData.mode === "visit") {
        return NextResponse.json(
          {
            message: "You are not allowed to modify this company",
          },
          { status: 403 }
        );
      }
      //delete mode
      delete companyData.mode;
      //delete monthlyPrice
      delete companyData.monthlyPrice;
      //delete requiredDocs
      delete companyData.requiredDocs;
    }

    // Connect to the database
    await dbConnect();

    // Update the company in the database
    const updatedCompany = await Company.findOneAndUpdate(filter, companyData, {
      new: true,
      runValidators: true,
    }).lean(); // Use .lean() for better performance

    if (!updatedCompany) {
      return NextResponse.json(
        { message: "Company not found" },
        { status: 404 }
      );
    }

    // Return the updated company data
    return NextResponse.json({ company: updatedCompany });
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

//delete
export async function DELETE(req: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(options);
    const user = session?.user || null;
    const userId = user?.id;

    // Validate userId
    userIdSchema.parse(userId);

    // Parse request body
    const body = await req.json();
    const companyId = body.id;

    // Validate companyId
    companyIdSchema.parse(companyId);

    // Create filter
    const filter = { user: userId, _id: companyId };

    if (user?.role === "admin") {
      delete filter.user;
    }

    // Connect to the database
    await dbConnect();

    // Find the company to delete
    const company = await Company.findOne(filter);
    if (!company) {
      return NextResponse.json(
        { message: "Company not found" },
        { status: 404 }
      );
    }

    //if mode is aided or visit dont allow modification
    if (
      user?.role !== "admin" &&
      (company.mode === "aided" || company.mode === "visit")
    ) {
      return NextResponse.json(
        {
          message: "You are not allowed to delete this company",
        },
        { status: 403 }
      );
    }

    // Delete the company from the database
    await Company.findByIdAndDelete(companyId);

    // Return success response
    return NextResponse.json({ message: "Company deleted successfully" });
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
