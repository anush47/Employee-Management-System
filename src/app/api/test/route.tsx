import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/app/lib/db";
import User from "@/app/models/User";

export async function GET(req: NextRequest) {
  await dbConnect();
  const users = await User.find();
  return NextResponse.json(users);
}
