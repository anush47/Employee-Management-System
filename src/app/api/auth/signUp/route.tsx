import dbConnect from "@/app/lib/db";
import User from "@/app/models/User";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcrypt";

export interface NewUser {
  name: string;
  email: string;
  password: string;
  role: "admin" | "employer";
}

// Define a schema for validation
const newUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(4, "Password must be at least 6 characters long"),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();

    // Validate the input using zod
    const parsedData = newUserSchema.parse(json);

    const { name, email, password } = parsedData;

    await dbConnect();

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "User Exists" }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Create and save the new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: "employer",
    });
    const addedUser = await newUser.save();

    return NextResponse.json(
      { message: "User created successfully", user: addedUser },
      { status: 201 }
    );
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: e.errors.reduce(
            (acc, error) => ({ ...acc, [error.path.join(".")]: error.message }),
            {}
          ),
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
