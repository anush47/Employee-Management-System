import dbConnect from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { options } from "../../auth/[...nextauth]/options";
import Company from "@/app/models/Company";
import { z } from "zod";
import Purchase from "@/app/models/Purchase";

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
    const month = req.nextUrl.searchParams.get("month");

    if (!companyId) {
      return NextResponse.json(
        { message: "Company ID is required" },
        { status: 400 }
      );
    }

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

    if (!companyId || !month) {
      return NextResponse.json(
        { message: "Company ID and month are required" },
        { status: 400 }
      );
    }

    if (user.role === "admin" && company.mode === "visit") {
      return NextResponse.json({ purchased: "approved" });
    }

    const purchased = await checkPurchased(companyId, month);
    console.log(purchased);

    return NextResponse.json({ purchased });
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

export const checkPurchased = async (companyId: string, period: string) => {
  const purchases = await Purchase.find({
    company: companyId,
  });

  if (!purchases) {
    return "unavailable";
  }

  const periodFormatted = `${period.split("-")[1]}-${period.split("-")[0]}`;
  let found = false;

  for (const purchase of purchases) {
    if (purchase.periods) {
      for (const p of purchase.periods) {
        if (p === periodFormatted || p === period) {
          found = true;
          if (purchase.approvedStatus !== "declined")
            return purchase.approvedStatus;
        }
      }
    }
  }

  if (!found) return "unavailable";

  return "declined";
};
