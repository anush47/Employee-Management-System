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
      body: `__VIEWSTATE=pBb7K2qz96ysOLgzUDOexSiDuQod0asqlRz30TrP%2FnxnjJlUjUMWn14ZMTMSFOwHvL%2Ba%2FBTl5qr7NmxQXNloJoTFJWT81QozPEwQXHywfV%2FWuelVcJXKC9KOiwk3CIRvZmMT7yy3IXsiYEuOl2fNDcrt0PXKlFNfwHV4YDABi9DggRlOt1D8pAWXs0i2C6t55krU7GWldHVbtCrn09GJqO%2F9kOMpoGyIuAORm2aY5OJ3o6fYtLKq94bmEwvoe4HiWp5HAuKfeReY3PfDCvPOMb9IKMLhodbo70yekCm%2BQBOYdRPcVNh3oetsKnzwBfquLdYzQ9b1Okebkxw30%2BVnASpPNdK%2FqfjoecNrBND8fPNvp8xVSsZTsvmsEuRljaOZDzmVjzOP%2BIG6oTIiOQYDG5%2BPjxyAImYy%2BixSm7K6TeT7aY1akwImq3oo6nXL0Vl0&__VIEWSTATEGENERATOR=7BA8A1FC&__EVENTVALIDATION=cjCEzscn25G2NX6rULf%2FkQyJFiQHYzieCuHA0xkQARFDqj8bpa970xhWV1gPiXW84z6lV2jVFTP%2BGG%2BEFpHASAE7oiTjW7b3GQjqw4vSxp7PcbgvaFG2oKoLz4epnkCT1bDch1eLJOTN3ZXbi6YZPM89uqsz9fbvwKPAIqyekNNRMVzsJmq%2Foka8z1vFD3I3zWz5gK9O%2FQ6p%2F0Aogge0W6n82bvknsFW38wUh3Wg7wqhK9CcdYXLqHVlkW0Hp5GwLsfs8hefhGOvvchxTyzzNTl5MJrC4EsJxf1D%2BHinPKMsmFYtITu7fdivcer6txKqR49zDmTuPPec2BS5mRf038PW2tXW1ctehFP6pjUgXPXQcTmBc3dQpduQKs%2BlgpqhLqHTMDDyV%2BL8LEij2baYjw%3D%3D&zn=${employer_no_zn}&em=${employer_no_number}&mn=${formattedPeriod}&sb=&checkb=Get+Reference`,
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
