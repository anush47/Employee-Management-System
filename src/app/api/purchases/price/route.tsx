import dbConnect from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { options } from "../../auth/[...nextauth]/options";
import Company from "@/app/models/Company";
import { z } from "zod";

// GET: Fetch price based on months and company ID
export async function GET(req: NextRequest) {
  try {
    // Validate user session
    const session = await getServerSession(options);
    const user = session?.user || null;
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    const companyId = req.nextUrl.searchParams.get("companyId");
    const months = req.nextUrl.searchParams.get("months");

    if (!companyId) {
      return NextResponse.json(
        { message: "Company ID is required" },
        { status: 400 }
      );
    }

    //Extract months into an array
    const monthsArray = months ? months.split(" ") : [];
    console.log(monthsArray);

    // Connect to the database
    await dbConnect();

    // Create company filter based on user role
    const companyFilter = { user: userId, _id: companyId };
    if (user?.role === "admin") {
      if (companyFilter.user) {
        delete (companyFilter as { user?: string }).user;
      }
    }

    // Fetch the company
    const company = await Company.findOne(companyFilter);
    if (!company) {
      return NextResponse.json(
        { message: "Company not found" },
        { status: 404 }
      );
    }

    // Calculate the price
    const pricePerMonth = company.monthlyPrice;
    const { totalPrice, finalTotalPrice } = calculateTotalPrice(
      pricePerMonth,
      monthsArray
    );

    // Apply discount for more than 3 months

    console.log(totalPrice, finalTotalPrice);

    return NextResponse.json({ totalPrice, finalTotalPrice });
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

//define function for calculation
export function calculateTotalPrice(pricePerMonth: number, months: string[]) {
  const noOfMonths = months.length;
  const totalPrice = pricePerMonth * noOfMonths;
  const finalTotalPrice = noOfMonths >= 3 ? totalPrice * 0.9 : totalPrice;
  return { totalPrice, finalTotalPrice };
}
