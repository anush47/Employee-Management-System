import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import dbConnect from "@/app/lib/db";
import Purchase from "@/app/models/Purchase";
import Company from "@/app/models/Company";
import { options } from "../auth/[...nextauth]/options";

// Define schema for purchase validation
const purchaseIdSchema = z.string().min(1, "Purchase ID is required");
const purchaseSchema = z.object({
  period: z.string().min(1, "Period is required"),
  company: z.string().min(1, "Company ID is required"),
  price: z.number().min(0, "Price must be a positive number"),
  request: z.string().min(1, "Request is required"),
  approvedStatus: z.enum(["approved", "pending", "rejected"]).optional(),
});

// GET: Fetch a purchase by ID or all purchases of the company
export async function GET(req: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(options);
    const user = session?.user || null;
    const userId = user?.id;

    // Validate user ID
    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    // Get the purchase ID from the URL query
    const purchaseId = req.nextUrl.searchParams.get("purchaseId");

    // Connect to the database
    await dbConnect();

    // Fetch the purchase(s) from the database
    if (purchaseId) {
      // Fetch a specific purchase by ID
      purchaseIdSchema.parse(purchaseId);

      const purchase = await Purchase.findById(purchaseId);

      if (!purchase) {
        return NextResponse.json(
          { message: "Purchase not found" },
          { status: 404 }
        );
      }

      // Ensure the purchase belongs to the user's company
      const company = await Company.findById(purchase.company);
      if (!company || company.user.toString() !== userId) {
        return NextResponse.json(
          { message: "Access denied." },
          { status: 403 }
        );
      }

      // Return the purchase data
      return NextResponse.json({ purchase });
    } else {
      // Fetch all purchases of the company
      const company = await Company.findOne({ user: userId });

      if (!company) {
        return NextResponse.json(
          { message: "Company not found" },
          { status: 404 }
        );
      }

      const purchases = await Purchase.find({ company: company._id });

      return NextResponse.json({ purchases });
    }
  } catch (error) {
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

// POST: Create a new purchase
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
    const parsedBody = purchaseSchema.parse(body);

    // Connect to the database
    await dbConnect();

    // Check if the company belongs to the user
    const company = await Company.findById(parsedBody.company);
    if (!company || company.user.toString() !== userId) {
      return NextResponse.json({ message: "Access denied." }, { status: 403 });
    }

    // Create a new purchase
    const newPurchase = await Purchase.create(parsedBody);

    return NextResponse.json({
      message: "Purchase created successfully",
      purchase: newPurchase,
    });
  } catch (error) {
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

// PUT: Update an existing purchase
export async function PUT(req: NextRequest) {
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
    const parsedBody = purchaseSchema
      .extend({ _id: z.string().min(1, "Purchase ID is required") })
      .parse(body);

    // Connect to the database
    await dbConnect();

    // Find the purchase to update
    const existingPurchase = await Purchase.findById(parsedBody._id);
    if (!existingPurchase) {
      return NextResponse.json(
        { message: "Purchase not found" },
        { status: 404 }
      );
    }

    // Check if the purchase belongs to the user's company
    const company = await Company.findById(existingPurchase.company);
    if (!company || company.user.toString() !== userId) {
      return NextResponse.json({ message: "Access denied." }, { status: 403 });
    }

    // Update the purchase
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
  } catch (error) {
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
