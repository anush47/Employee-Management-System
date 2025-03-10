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
          '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
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
      body: `__VIEWSTATE=bUhjJlxt5SXpQFP%2BSJMOmZOy36rqwCwtmpVckH%2FyTNH5TcusJuOzTLDTcs2EfBKgLFeXa5EK8El3O8TTwLn3831ju5sgl0lk2LpWGPlilsvNrAdpofcWCzngEl8kvJXEEjeT6%2BEeLCZBC0z%2BZ6wohUXJ0pw0LOLOYd8JqLNZO1CesJ%2B%2F922ljXMesNJ0fXgERm08RGdaTKxxVpi8T3J8%2F%2FAUooNahwTCbtjLcmoFGI8U7o7upuHzY%2BwRN2e%2BElVQtUYr6RcqawKb190JigdxTYlfm3kTHr7krdgLEu%2BAEo81Mo%2FVA%2BdBudzr3rlo9k8WBiK%2BzsA8y3D12p2O5kqLAVIpcDaYGZSdIIWHSB52feySnW0DgK1tM%2Fm%2BTVocFmosX3kbJq%2Bg%2F%2B5f7QktlqJ6wSpZypkX0uy97Hdu8Lb%2FGe2xQhS3cyHK2T2QMtCkIivifNjFmYVBfMTMU7F%2BdLF43%2FHYEqrd6djbMT8UfsXNXu1DU5uSescwD0kM1GNNhUKi&__VIEWSTATEGENERATOR=7BA8A1FC&__EVENTVALIDATION=FpFvDaJx2uK1rgjgBpbOyp9TTngy0%2FPgLHUvJ3xRH6Xb190Dv32U6naF9eyP%2FGHzOO2nHQn6ZLvnI5jjW9%2F2%2FZPsYxtPjznNoijTRvwKIeIf0x%2Bs5QguPywmsavok8QqrXiLS2u%2ByYu%2F9OBiWZ4jZtq6%2FjbZGaHD%2Bpp0R0lcVC3E2CkeYrrkRJ38TYLCwbvIpSPxOd5RoEgn7HvUFTAD0B9LaaVjPqP3qtlti7Mtq6BWdjQfoBYSO82MdkbLoeNoeasqwS91JqaUUcAJj0GD%2FBpwdUCvMycxsg06Bbk%2FS%2B%2FcNYh29kp92Nlt6aD%2F0etfHoXc0Dmwbk175iv5EF9wdIWNt3Ldc6L6CkW5DjulpZc%3D&zn=${employer_no_zn}&em=${employer_no_number}&mn=${formattedPeriod}&sb=1&checkb=Get+Reference`,
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
