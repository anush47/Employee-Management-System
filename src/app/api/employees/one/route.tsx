import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth"; // Adjust import as needed
import { z } from "zod";
import dbConnect from "@/app/lib/db";
import Employee from "@/app/models/Employee";
import { options } from "../../auth/[...nextauth]/options";
import Company from "@/app/models/Company";
import { calculateMonthlyPrice } from "../../purchases/price/priceUtils";

// Define schema for validation
const userIdSchema = z.string().min(1, "User ID is required");
const employeeIdSchema = z.string().min(1, "Employee ID is required");

export async function GET(req: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(options);
    const user = session?.user || null;
    const userId = user?.id;

    // Validate userId
    userIdSchema.parse(userId);

    // Get the employeeId from URL
    const employeeId = req.nextUrl.searchParams.get("employeeId");
    // Validate employeeId
    employeeIdSchema.parse(employeeId);

    // Connect to the database
    await dbConnect();

    // Fetch employee from the database
    const employee = await Employee.findById(employeeId); // Use .lean() for better performance

    // Create filter
    const filter: { user?: string; _id: string } = {
      user: userId,
      _id: employee?.company,
    };
    if (user?.role === "admin") {
      // Remove user from filter
      delete filter.user;
    }

    const company = await Company.findOne(filter);
    if (!company) {
      return NextResponse.json(
        { message: "Access denied. You cannot add employees to this company." },
        { status: 403 }
      );
    }

    // Return the employee data
    return NextResponse.json({ employee });
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
// Define schema for employee update
const employeeSchema = z.object({
  _id: z.string().min(1, "Employee ID is required"),
  name: z.string().min(1, "Employee name is required"),
  memberNo: z.number().min(1, "Member number is required"),
  nic: z
    .string()
    .regex(
      /^(?:[0-9]{9}[vVxX]|[0-9]{12})$/,
      "NIC must be a valid format (e.g., 123456789V or 123456789012)"
    )
    .optional(),
  divideBy: z.union([z.literal(240), z.literal(200)]).default(240),
  active: z.boolean().default(true),
  basic: z.number().min(0, "Basic salary must be a positive number"),
  totalSalary: z.union([z.string(), z.number(), z.null()]),
  startedAt: z.string().optional(), // Assuming the date format is "DD-MM-YYYY"
  resignedAt: z.string().optional(), // Assuming the date format is "DD-MM-YYYY"
  company: z.string().min(1, "Company ID is required"),
  designation: z.string().optional(),
  remark: z.string().optional(),
  otMethod: z.string(),
  probabilities: z
    .object({
      workOnOff: z.number().optional(),
      workOnHoliday: z.number().optional(),
      absent: z.number().optional(),
      late: z.number().optional(),
      ot: z.number().optional(),
    })
    .optional(),
  workingDays: z
    .object({
      mon: z.string(),
      tue: z.string(),
      wed: z.string(),
      thu: z.string(),
      fri: z.string(),
      sat: z.string(),
      sun: z.string(),
    })
    .optional(),
  shifts: z
    .array(
      z.object({
        start: z.string(),
        end: z.string(),
      })
    )
    .optional(),
  paymentStructure: z
    .object({
      additions: z.array(
        z.object({
          name: z.string(),
          amount: z.union([z.string(), z.number(), z.null()]),
          affectTotalEarnings: z.boolean().optional(),
        })
      ),
      deductions: z.array(
        z.object({
          name: z.string(),
          amount: z.union([z.string(), z.number(), z.null()]),
          affectTotalEarnings: z.boolean().optional(),
        })
      ),
    })
    .optional(),
  phoneNumber: z
    .string()
    .regex(/^\d{10}$/, "Phone number must be a valid")
    .optional(),
  email: z.string().email("Email must be a valid email").optional(),
  address: z.string().optional(), // Add this line
});

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
    //trim name and nic
    body.name = body.name.trim();
    body.nic = body.nic.trim();
    //capitalize nic and name
    body.name = body.name.toUpperCase();
    body.nic = body.nic.toUpperCase();

    //convert to number
    body.memberNo = parseInt(body.memberNo);
    body.basic = parseFloat(body.basic);
    //email phone number and address if ""
    if (body.email === "") {
      delete body.email;
    }
    if (body.phoneNumber === "") {
      delete body.phoneNumber;
    }
    if (body.address === "") {
      delete body.address;
    }

    const parsedBody = employeeSchema.parse(body);

    // Connect to the database
    await dbConnect();

    // Create filter
    const filter: { user?: string; _id: string } = {
      user: userId,
      _id: parsedBody?.company,
    };
    if (user?.role === "admin") {
      // Remove user from filter
      delete filter.user;
    } else {
      //remove probabilities
      delete parsedBody.probabilities;
      // if otmethod is random show error
      if (parsedBody.otMethod === "random") {
        return NextResponse.json(
          { message: "OT method cannot be random" },
          { status: 400 }
        );
      }
    }

    // Find the company by ID to ensure it exists and belongs to the user
    const company = await Company.findOne(filter);
    if (!company) {
      return NextResponse.json(
        {
          message:
            "Access denied. You cannot update employees in this company.",
        },
        { status: 403 }
      );
    }

    // Check if the company is in visit mode or aided mode if not an admin
    if (
      user?.role !== "admin" &&
      (company.mode === "aided" || company.mode === "visit")
    ) {
      return NextResponse.json(
        {
          message: "You are not allowed to update employees in this company",
        },
        { status: 403 }
      );
    }

    // Find the existing employee
    const existingEmployee = await Employee.findById(parsedBody._id);
    if (!existingEmployee) {
      return NextResponse.json(
        { message: "Employee not found" },
        { status: 404 }
      );
    }

    // Check if the updated memberNo is unique within the company
    const employees = await Employee.find({
      company: parsedBody.company,
      _id: { $ne: parsedBody._id }, // Exclude the current employee being updated
    });
    for (const employee of employees) {
      if (employee.memberNo === parsedBody.memberNo) {
        return NextResponse.json(
          { message: "Employee with this member number already exists" },
          { status: 400 }
        );
      }
    }

    // Update the employee in the database
    const updatedEmployee = await Employee.findByIdAndUpdate(
      parsedBody._id,
      {
        ...parsedBody,
        paymentStructure:
          parsedBody.paymentStructure || existingEmployee.paymentStructure,
      },
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    if (!updatedEmployee) {
      return NextResponse.json(
        { message: "Failed to update employee" },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json({ message: "Employee updated successfully" });
  } catch (error) {
    // Handle Zod validation errors
    console.log(error);
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

//delete employee
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
    const employeeId = body.employeeId;

    // Validate employeeId
    employeeIdSchema.parse(employeeId);

    // Connect to the database
    await dbConnect();

    // Find the employee to delete
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return NextResponse.json(
        { message: "Employee not found" },
        { status: 404 }
      );
    }

    // Create filter
    const filter = { user: userId, _id: employee?.company };
    if (user?.role === "admin") {
      // Remove user from filter
      delete filter?.user;
    }
    // Find the company to ensure it belongs to the user
    const company = await Company.findOne(filter);
    if (!company) {
      return NextResponse.json(
        {
          message:
            "Access denied. You cannot delete employees in this company.",
        },
        { status: 403 }
      );
    }
    //if company is in visit mode or aided mode
    if (
      user?.role !== "admin" &&
      (company.mode === "aided" || company.mode === "visit")
    ) {
      return NextResponse.json(
        {
          message: "You are not allowed to delete employees in this company",
        },
        { status: 403 }
      );
    }

    // Delete the employee from the database
    await Employee.findByIdAndDelete(employeeId);

    // Update the company's monthly price if needed
    if (!company?.monthlyPriceOverride) {
      const [employeeCount, activeEmployeeCount] = await Promise.all([
        Employee.countDocuments({ company: company._id }),
        Employee.countDocuments({ company: company._id, active: true }),
      ]);
      const price = calculateMonthlyPrice(
        company,
        employeeCount,
        activeEmployeeCount
      );
      if (price !== company.monthlyPrice) {
        // Update the company's monthly price if it has changed
        company.monthlyPrice = price;
        await company.save();
      }
    }

    // Return success response
    return NextResponse.json({ message: "Employee deleted successfully" });
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
