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
      body: `__VIEWSTATE=C0bpWxPt2xCjousfT8878G2rP0QjLXCzBl0yk0dSfvXDWPNmBq0mNC1LtmM2bDa%2F2NgvoK%2FvdOhDYQte4qLPI42lw3iKBgU9YK%2FDN3IIJLTEx2cMorvuvN9mybFI2khTYvWde9lLy2EiffLPKz%2BWrgWZFTH5GduZgtA0iBunQlL62BtrjK7IOn1XjfwlCv4vBHd1dPxAEWOc%2FyMCXxfI60wUa6NFS88PpC5Up93Tk0Et%2BRAr0RjFV0kCGy9bQ6eXsAQ%2FyvgKQR%2BmzxzPOlWd8z%2BD11sdgXppFzW5SZh1l16DvqR%2FDuJWq0NlzKUp3XSs5eHJ41KsIS4sLB85yWG6kQq1CS2gFuHENi8AIO%2Fzdx5oEcnjh79FWDJBwrT8CZwbW1HarVtFdSvysFIhRugke%2Fgb20XoB66AULE4vRV8E477xo2Ski%2B4kSb9%2B0QxdqqG2nTKcr9ShctkDH7gE2JBh4719X2lAQVC%2BTPfPHMTQKS9rIohtPJ3lwIMVkprGnDq%2FKYYrq6g5xIcVu4K2gH4BA%3D%3D&__VIEWSTATEGENERATOR=7BA8A1FC&__EVENTVALIDATION=S%2Fvmln4H5YAPuwq4vv4rCglGR2wjOXhowLNm3Q8y72ZXGyzEFjK1x3Ls1ydCYDQk82hVS4d0OWi%2BfwLKSQDqjRa9Dqwx9ykY%2F%2B1u54jVVxJxdOl7nu2YRePWXx27WKiDQhcO84FJh5UhEX6zTvzcivwLDCq794Sxx9zT9FX02QDTLjHv2ctJZVeKKwq9vI4cnTawoe8bVNQ0ZieelCFbkqPui%2BbVXinNc51%2BujkUjxia09jqf2uBmIsb74uc5H4%2FkZWJPDXVmHfOcAC2UrkKicEHRYMiKL%2FjkJs%2FEqlHuaZ6tlVLRrJDeUdYxofiT5meUQ1dWrd1GMmphmgHyA1Wz5mIx7VsrNFqSw00nzo4GDgcnQlDMQRj5aTH2S4aHhdf&zn=${employer_no_zn}&em=${employer_no_number}&mn=${formattedPeriod}&sb=1&checkb=Get+Reference`,
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
