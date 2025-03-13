import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import dbConnect from "@/app/lib/db";
import { options } from "../../auth/[...nextauth]/options";
import { getHolidays } from "./holidayHelper";

const daySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: "Day must be in the format yyyy-mm-dd",
});

export const dynamic = "force-dynamic";

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
