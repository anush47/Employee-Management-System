import Company from "@/app/models/Company";
import dbConnect from "@/app/lib/db";
import { Schema } from "mongoose";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { options } from "../auth/[...nextauth]/options";
import { handleData } from "../salaries/inOutProcessing";

// GET request handler
export async function GET(req: NextRequest) {
  const records = [
    { ID: "1", Datetime: "2024-09-17T17:00:00" },
    { ID: "1", Datetime: "2024-09-17T08:00:00" },
    { ID: "1", Datetime: "2024-09-18T08:00:00" },
    { ID: "1", Datetime: "2024-09-18T15:00:00" },
    { ID: "2", Datetime: "2024-09-17T08:00:00" },
    { ID: "2", Datetime: "2024-09-17T17:00:00" },
    { ID: "2", Datetime: "2024-09-18T08:00:00" },
    { ID: "2", Datetime: "2024-09-18T17:00:00" },

    // Add more records as needed
  ];
  handleData(records);
  return NextResponse.json({
    test: "ahh",
  });
}
