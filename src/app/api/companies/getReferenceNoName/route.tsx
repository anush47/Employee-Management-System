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
      body: `__VIEWSTATE=Pq%2FEzx%2B3G6z1gvxZo9gb3F7KIVl8em3Lj6lbAU%2FQURT%2BGJvzODuc81uBl7PKSzHrfTZLM4P1mCXSCumO4C5fT5Zg3kSezFL3%2FkhVUYd%2F6OKSNkNdjHKfHwPz3Qa4bGHM3k96VhnA2EWcPrcMwOdSaVPTZ8pTYr8UFzZZ2HY%2FzD4CgkwhWzcjVaksw1mqcMfLN1RqWaMWLeu%2FLeyGGURQMjAkIaRU7g046pSUZKTjDdLq3mZQdqN4rzfoM4sYLEHndiUbWSn80A%2BgxJdHplmSIqG4uGwN%2BtpOvtkSBMjvSf0CIb7%2Beo8alUxjZp%2FSQ2%2BurzDnrl0izFIkZy53RCE%2BCfj690fD7xsF9ZSGaLMkWQf0QBgbPFjGfBZbns3Nh3ike3iVGi9umgMCoP0dln54QCEWvcwdPjJ41PpB4eZzVpqK0SMEwqWLeb2ReE0ZHng5sppHfPw%2F%2FkyM5jewKGzVHXszGrlm7oLu7Sf2mfUDnRw%3D&__VIEWSTATEGENERATOR=7BA8A1FC&__EVENTVALIDATION=6aQYaxZIUeG5D5qpg26WuLUwTta6w7Ik3ipYvHi0ijOgtfQujtPVFcISSapwAqzPZLskiiQdFxpnzln8ID5YEWQzdnZKLZeoy3iQfFaHZ6hb5Vkd1drno7CRZ8Ac5kOLnrrh%2FrOoV3zcLCSSpMQEM%2ByQNPqt3oeFQYt%2BP%2FeYDiy4rpwSOz4UaT6FXN%2BfiYZYL4fGGBJTU8LbF8tmz3OlMX7IzZZ4Hffc4JcgD7vMS5ayR0Puza6n854lDTXrxjutpvuP4NwYCVAySNnncJilQmakG5zYw6VANi7bMMhlGU7U6Qa2RG8UMWO2CMgfeGkZEVzoBG1HGhjRAnJNXz9hFg%3D%3D&&zn=${employer_no_zn}&em=${employer_no_number}&mn=${formattedPeriod}&sb=1&checkb=Get+Reference`,
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
