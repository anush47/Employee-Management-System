// import Company from "@/app/models/Company";
// import dbConnect from "@/app/lib/db";
// import { Schema } from "mongoose";
// import { getServerSession } from "next-auth";
// import { NextRequest, NextResponse } from "next/server";

// // GET request handler
// export async function GET(req: NextRequest) {
//   const records = `employee,time
// 66fc6d7f01826f37548d4e5c,2024-09-30T08:10:00
// 66fc6d7f01826f37548d4e5c,2024-09-30T17:05:00
// 66fc6d8b01826f37548d4e81,2024-09-30T07:55:00
// 66fc6d8b01826f37548d4e81,2024-09-30T17:10:00
// 66fc6d7f01826f37548d4e5c,2024-10-01T08:20:00
// 66fc6d7f01826f37548d4e5c,2024-10-01T17:15:00
// 66fc6d8b01826f37548d4e81,2024-10-01T08:05:00
// 66fc6d7f01826f37548d4e5c,2024-10-02T08:00:00
// 66fc6d7f01826f37548d4e5c,2024-10-02T17:25:00
// 66fc6d8b01826f37548d4e81,2024-10-02T08:15:00
// 66fc6d8b01826f37548d4e81,2024-10-02T16:50:00
// 66fc6d7f01826f37548d4e5c,2024-10-03T08:30:00
// 66fc6d8b01826f37548d4e81,2024-10-03T08:45:00
// 66fc6d8b01826f37548d4e81,2024-10-03T17:05:00
// 66fc6d7f01826f37548d4e5c,2024-10-04T08:10:00
// 66fc6d7f01826f37548d4e5c,2024-10-04T17:10:00
// 66fc6d8b01826f37548d4e81,2024-10-04T08:20:00
// 66fc6d8b01826f37548d4e81,2024-10-04T17:00:00
// 66fc6d7f01826f37548d4e5c,2024-10-05T08:00:00
// 66fc6d7f01826f37548d4e5c,2024-10-05T17:20:00
// 66fc6d8b01826f37548d4e81,2024-10-05T08:30:00
// 66fc6d7f01826f37548d4e5c,2024-10-06T08:45:00
// 66fc6d7f01826f37548d4e5c,2024-10-06T17:25:00
// 66fc6d8b01826f37548d4e81,2024-10-06T08:50:00
// 66fc6d8b01826f37548d4e81,2024-10-06T17:10:00
// 66fc6d7f01826f37548d4e5c,2024-10-07T08:05:00
// 66fc6d7f01826f37548d4e5c,2024-10-07T17:15:00
// 66fc6d8b01826f37548d4e81,2024-10-07T08:25:00
// 66fc6d8b01826f37548d4e81,2024-10-07T17:00:00
// 66fc6d7f01826f37548d4e5c,2024-10-08T08:35:00
// 66fc6d7f01826f37548d4e5c,2024-10-08T17:05:00
// 66fc6d8b01826f37548d4e81,2024-10-08T08:15:00
// 66fc6d8b01826f37548d4e81,2024-10-08T17:25:00
// 66fc6d7f01826f37548d4e5c,2024-10-09T08:40:00
// 66fc6d7f01826f37548d4e5c,2024-10-09T17:10:00
// 66fc6d8b01826f37548d4e81,2024-10-09T08:50:00
// 66fc6d8b01826f37548d4e81,2024-10-09T17:00:00
// 66fc6d7f01826f37548d4e5c,2024-10-10T08:00:00
// 66fc6d7f01826f37548d4e5c,2024-10-10T17:15:00
// 66fc6d8b01826f37548d4e81,2024-10-10T08:30:00
// 66fc6d8b01826f37548d4e81,2024-10-10T17:20:00
// `;
//   const inOut = initialInOutProcess(records);
//   const period = "2024-10";
//   const salaries: {
//     _id: string;
//     inOut: {};
//     employee: any;
//     period: string;
//     basic: any;
//     noPay: { amount: number; reason: string };
//     ot: { amount: number; reason: string };
//     paymentStructure: { additions: any; deductions: any };
//     advanceAmount: number;
//     finalSalary: number;
//   }[] = [];
//   for (const key of Object.keys(inOut)) {
//     const emp = await Employee.findById(key);
//     //const salary = await generateSalaryForOneEmployee(emp, period, inOut[key]);
//     //   if ("message" in salary) {
//     //     console.error(
//     //       `Error generating salary for employee ${key}: ${salary.message}`
//     //     );
//     //   } else {
//     //     salaries.push(salary);
//     //   }
//   }
//   return NextResponse.json({ salaries }, { status: 200 });
// }
