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

    //console.log(name, referenceNo);

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
          '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
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
      body: `__VIEWSTATE=j6QqsLG6NG8koGS%2BdOi%2FO68MJxxifb2pG3Yw80wPX91qhT1rlvGytIbhFzRl2yd3BMCYlHYZuadPt6e8Nky4uVOYN%2FcpdH7pCVuVgGzuQboa9hI7bryG7mfRUPod%2BtR4tpAEteewXoSz8xYONPo55whAUHTruKv0aVTI5cyweHNMGS8lTe36mVpKHMdEviypUT4F24OGOSX7nz9GcJbUZycKMJKGTA5TB1pAtQOXVu%2BHPAWpVx3%2BYGwhUo0Z9xtu%2F3TmxB9CYb5JWcKTsJfN4M9VoyADKYoDVjhi2vCECqelL2023IxozBkIPoWj%2B85Rn1CtxxnFP4uDBYxFYu0EbuA8kla9Yq6Eik8ZoDNe944mzLbHcHmZLiPk%2ByclewCrm%2F4Ifoj4SDiN7o88f3HZ3Ow3XupGMciritDgJb93tFEgmbOL5QQAWiHNGH7PQ6tydGT3wq4o%2Fa%2BvLtXFWCZsRyGpEj9qth3UX3mx%2FHNMTGUGLbo2l1rLZnIL2MCNKVTWOXLz0qxoPmWNUfzqv%2FV0Pl4%2FF9PeMpLjE3zXxFO%2BSEOmVFfx2Y9ot1zVN8h5wbJ7FU61lVowb3ShNHFjO67xbUmFjgk9WHnsnfFnWy61AnjijroQ%2BV9ZGqXe%2BVmNa2Fx8MGEZCPQckSrKfVGorGEdQ%3D%3D&__VIEWSTATEGENERATOR=7BA8A1FC&__EVENTVALIDATION=BsBdEVd4DCGU9O2ugy%2BjAOtvu4zooCK8KZJHRopEIWSFrjFppCN1F%2Fhfro9%2BIj0%2FqhwAxYI42GEVeismgB9gfVfhXu54Rwsax5ZDJdz4dztn439FaMKjnbarocJT7h7p%2BjK79yIcsNCt%2Fe%2BFBkypc6a4qanIlRgiEAAh6tsSQZdzJEIt5iE7Aom4XOi%2FZEYOzOL6xS846ccKTwCSQ45wuueAqq4DhjuVis5xNTD1OTWvgR6YFNmsqIDTqH5m3RT91MwUYjqTh8qdn5zxTz9T93fdWTQTbw1bWpiniaI7HUd6dfa5LLUHxZYsjZhJmd3gtj046SXyRAIM1sp1J6bQC3oht1ZZwFZRvLz0Dtsc3xRn3wxYwUUalD%2F1PJod3QdiIehlmSfIdj2TG7SQgDEiZPUrwjdUm37EXbfY%2BNCuPBsGsjijUVTkzmYQzN0jlLNu3xeeK1Pfe%2Fvy%2BWxw1A%2Fr5N6wodmGoi%2F3kMuFn7hjC5XWONvMPYTIDm87J41XN0cd&zn=${employer_no_zn}&em=${employer_no_number}&mn=${formattedPeriod}&sb=1&checkb=Get+Reference`,
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

    console.log(employer_name, reference_no);

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
