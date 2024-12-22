import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/options";
import { z } from "zod";

//employerNoSchema
const employerNoSchema = z
  .string()
  .min(1, "Employer Number is required")
  .regex(
    /^[A-Z]\/\d{5}$/i,
    "Employer Number must match the pattern A/12345 or a/12345"
  );

//period schema
const periodSchema = z
  .string()
  .min(1, "Period is required")
  .regex(/^\d{4}-\d{2}$/i, "Period must match the pattern YYYY-MM");

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

    const employerNo = employerNoSchema.parse(body.employerNo);
    let period = body.period;

    // if period not available
    if (!period) {
      const date = new Date();
      date.setMonth(date.getMonth() - 2);
      period = date.toISOString().slice(0, 7);
    }

    period = periodSchema.parse(period);

    // Get reference number and name
    const [referenceNo, name] = await get_ref_no_name(employerNo, period);

    // Return success response
    return NextResponse.json({ name, referenceNo });
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

const get_ref_no_name = async (employer_no: string, period: string) => {
  const [employer_no_zn, employer_no_number] = employer_no.split("/");
  const formattedPeriod = period.replace("-", "");

  try {
    const response = await fetch("https://www.cbsl.lk/EPFCRef/", {
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "en-LK,en-GB;q=0.9,en-US;q=0.8,en;q=0.7,si;q=0.6",
        "cache-control": "no-cache",
        "content-type": "application/x-www-form-urlencoded",
        pragma: "no-cache",
        priority: "u=0, i",
        "sec-ch-ua":
          '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        Referer: "https://www.cbsl.lk/EPFCRef/",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: `__VIEWSTATE=JH66%2BqN2%2FVxephDgXi6S5z3Ms5l2mJ%2BE34ZNZ50QKWSoXeiwuOuzNJWHp7ToNrmMUM3TkI7dUMNWk%2B7ItNMrSqYAWJe10QrtkV%2B2xftmu0ztBLYujDgswuvEMcnIa5SCjczDIlduylLCkprYYU5BxQibZHozh9sb6ki3yDdI4q7c1teZuK4aQwBnrJ5PS%2BwpgYCV9JBnOvdPHzeiYI1k6RuttwVOTce%2FRH0AKN3IM47LBeJd3qeSbsodpiu4hEIzc%2B2XVt9NCxoLpISfFt5Tueg61FXe5%2F%2FApd8P%2BTL3mIX8f0NYw1JGXsE6KwnDBYSHc2IAMGauOQz1pC2TbbUkSOKjq1nc4r9%2BNJBnTVxZRhqFZC%2F3T0P8N7VYmoDdfTgb8Ob9R7KsV0lO87hDfc5CZ0t1gs4J9DNT4%2BXafPUvEMjPu%2F1V2ZkKPQ9duxiT4C7e9gGrbiS28yPj714y7J7S7OLGlLljieebzP3I0fXxG%2FNdQkp3y6qNlYElBkZGrfYo8meX88QItd%2BmF3tDNZeE1Q%3D%3D&__VIEWSTATEGENERATOR=7BA8A1FC&__EVENTVALIDATION=gDgWbmSyB%2BSn4NmDhbilZfYoPxyR1AW4yP3C568kz5mE8eA89EPqSh9mdIbfxma8qUbrgj0ZwvomEUNSZPvVIbNINJJWniPFz9ktJiOXjzZWcTJydJhZZiejAShmGZ%2FFFzJaiBinCx0dJHHD3%2FtMopH9cbC1kT7LjmVrYuUTaRe0UoFxXyJMTf7IzJ4J8l6mnWTfRBy1J%2B%2FB2hbS4oneGCSI6T0htpWe%2Bjxm%2FW6F62phizbucdT%2Ftctg4DauhAhUw4CVG1wD4isjFryLzZUYQWa6tnvYBwRaNCZQRHjCV%2FUChUNtpbmOOri5xMIqdRGdA5Mek44GLwOetsb69aUaw%2BxPUzQai7oZggyj5E%2B%2FucPYEHAibZMvsjwQVywaL6zN&zn=${employer_no_zn}&em=${employer_no_number}&mn=${formattedPeriod}&sb=1&checkb=Get+Reference`,
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const text = await response.text();

    // Extract employer name
    const matchName = text.match(/<span id="empnm">.*<\/span>/);
    const employer_name = matchName
      ? matchName[0]
          .replace(/<[^>]*>/g, "")
          .split(":")[1]
          .trim()
      : null;

    // Extract reference number
    const matchRef = text.match(/<span id="refno">.*<\/span>/);
    const reference_no = matchRef
      ? matchRef[0]
          .replace(/<[^>]*>/g, "")
          .split(":")[1]
          .trim()
      : null;

    return [reference_no, employer_name];
  } catch (error) {
    if (error instanceof Error) {
      console.error("An error occurred:", error.message);
    } else {
      console.error("An unknown error occurred");
    }
    return [null, null];
  }
};
