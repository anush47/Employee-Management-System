import Company from "@/app/models/Company";
import dbConnect from "@/app/lib/db";
import { Schema } from "mongoose";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { options } from "../auth/[...nextauth]/options";

// Function to add a new company
export async function addCompany(
  name: string,
  employerNo: string,
  address: string,
  userId: string
) {
  try {
    // Create a new company instance
    const newCompany = new Company({
      name,
      employerNo,
      address,
      user: userId,
    });

    // Save the new company to the database
    const savedCompany = await newCompany.save();

    // Return the saved company
    return savedCompany;
  } catch (error) {
    // Handle errors and rethrow if necessary
    console.error("Error adding company:", error);
    throw new Error("Failed to add company");
  }
}

// GET request handler
export async function GET(req: NextRequest) {
  try {
    // Hardcoded userId (ensure this is a valid ObjectId)
    const hardcodedUserId = "669c2a6be24a83e3a6db1257"; // Replace with a valid ObjectId
    await dbConnect();

    // Call the addCompany function
    const company = await addCompany(
      "Company Name",
      "123456",
      "1234 Address St",
      hardcodedUserId
    );

    // Return the created company data
    return NextResponse.json({ company }, { status: 201 });
  } catch (error) {
    // Handle errors
    console.error("Error handling GET request:", error);
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
