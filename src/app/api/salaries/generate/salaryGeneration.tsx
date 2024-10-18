import { inOutGen, inOutProcess } from "../inOutProcessing";

// Types for InOut
export type RawInOut = Date[]; // Unprocessed in/out records
export type ProcessedInOut = {
  in: String;
  out: String;
  workingHours: number;
  otHours: number;
  ot: number;
  noPay: number;
  holiday: string;
  description: string;
}[];

// Helper function to check if inOut is already processed
function isProcessed(
  inOut: RawInOut | ProcessedInOut
): inOut is ProcessedInOut {
  return (
    Array.isArray(inOut) &&
    inOut.length > 0 &&
    typeof inOut[0] === "object" &&
    "workingHours" in inOut[0]
  );
}

function calculateSalaryDetails(
  source: {
    paymentStructure: {
      additions: { name: string; amount: string }[];
      deductions: { name: string; amount: string }[];
    };
    basic: number;
  },
  salary: { noPay: { amount: number } }
) {
  let parsedAdditions = source.paymentStructure.additions.map(
    (addition: { name: string; amount: string }) => ({
      name: addition.name,
      amount: parseValue(addition.name, addition.amount, source.basic),
    })
  );

  let parsedDeductions = source.paymentStructure.deductions.map(
    (deduction: { name: string; amount: string }) => {
      if (deduction && deduction.name !== "EPF 8%") {
        return {
          name: deduction.name,
          amount: parseValue(deduction.name, deduction.amount, source.basic),
        };
      }
    }
  );

  let basicForSalary = 0;
  if (salary && salary.noPay) {
    basicForSalary = source.basic - salary.noPay.amount;
  } else {
    basicForSalary = source.basic;
  }

  parsedDeductions.push({
    name: "EPF 8%",
    amount: basicForSalary * 0.08,
  });

  //remove undefined
  parsedDeductions = parsedDeductions.filter(
    (deduction: { name: string; amount: number } | undefined) => deduction
  );

  parsedAdditions = parsedAdditions.filter(
    (addition: { name: string; amount: number }) => addition
  );

  const totalAdditions = parsedAdditions.reduce(
    (total: number, addition: { amount: number }) => total + addition.amount,
    0
  );

  const totalDeductions = parsedDeductions.reduce(
    (total: number, deduction: { amount: number } | undefined) =>
      total + (deduction ? deduction.amount : 0),
    0
  );

  return {
    parsedAdditions,
    parsedDeductions,
    totalAdditions,
    totalDeductions,
  };
}

// Helper function to parse the value for additions/deductions
function parseValue(name: string, value: string, basic: number): number {
  if (typeof value === "string" && value.includes("-")) {
    // If the value is a range like "2000-5000", pick a random multiple of 100 within the range
    const [min, max] = value.split("-").map(Number);
    const randomValue =
      Math.floor(Math.random() * ((max - min) / 100 + 1)) * 100 + min;
    return randomValue;
  } else if (value === "" || isNaN(Number(value))) {
    // If the value is empty or not a number, set a random value as a multiple of 100
    // based on 5% to 15% of the basic salary
    const randomValue = Math.floor((Math.random() * 0.1 + 0.05) * basic);
    return Math.round(randomValue / 100) * 100; // Round to the nearest multiple of 100
  } else {
    // Otherwise, it's a fixed value like "3000", so parse it as a number and round to nearest 100
    return Math.round(Number(value) / 100) * 100;
  }
}

// Helper function to generate a random object ID
function generateObjectId(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16); // 4-byte timestamp in hex
  const randomPart = Math.random().toString(16).substr(2, 10); // 5-byte random hex string
  const counter = Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0"); // 3-byte counter

  return timestamp + randomPart + counter;
}

// Function to generate salary for an employee
export async function generateSalaryForOneEmployee(
  employee: any,
  period: string,
  inOut: RawInOut | ProcessedInOut | undefined,
  salary?: any
) {
  try {
    const source = salary || employee;

    let ot = 0;
    let noPay = 0;
    let otReason = "";
    let noPayReason = "";
    let inOutProcessed: ProcessedInOut | RawInOut = [];

    // Only sort if the data is unprocessed (RawInOut)
    if (inOut && !isProcessed(inOut)) {
      inOutProcessed =
        (inOut as RawInOut)?.sort(
          (a: Date, b: Date) => a.getTime() - b.getTime()
        ) || [];
    } else {
      inOutProcessed = inOut as ProcessedInOut; // If already processed, use it as is
    }
    // Choose the appropriate overtime calculation method
    switch (employee.otMethod) {
      case "noOt":
        ({ ot, otReason, noPay, noPayReason, inOutProcessed } = noOtCalc(
          employee,
          period,
          inOutProcessed,
          salary
        ));
        break;
      case "calc":
        ({ ot, otReason, noPay, noPayReason, inOutProcessed } = OtCalc(
          employee,
          period,
          inOutProcessed,
          salary
        ));
        break;
      default:
        ({ ot, otReason, noPay, noPayReason, inOutProcessed } = randomCalc(
          employee,
          period,
          inOutProcessed,
          salary
        ));
        break;
    }

    const {
      parsedAdditions,
      parsedDeductions,
      totalAdditions,
      totalDeductions,
    } = calculateSalaryDetails(source, salary);

    const finalSalary =
      employee.basic + totalAdditions + ot - totalDeductions - noPay;

    const salaryData = {
      _id: salary ? salary._id : generateObjectId(),
      inOut: inOutProcessed,
      employee: employee._id,
      period,
      basic: source.basic, // Employee's basic salary
      noPay: {
        amount: noPay, // No Pay deduction amount
        reason: noPayReason, // Reason for no pay
      },
      ot: {
        amount: ot, // Overtime payment
        reason: otReason, // Reason for overtime
      },
      paymentStructure: {
        additions: parsedAdditions, // Additions with computed values
        deductions: parsedDeductions, // Deductions with computed values
      },
      advanceAmount: salary ? salary.advanceAmount : 0, // Example advance amount
      finalSalary,
      remark: "",
    };

    return salaryData;
  } catch (error) {
    return {
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

// Random overtime calculation
const randomCalc = (
  employee: any,
  period: string,
  inOutProcessed: ProcessedInOut | RawInOut,
  salary: any
) => {
  let {
    inOutProcessed: processedInOut,
    ot,
    noPay,
    otReason,
    noPayReason,
  } = inOutGen(employee, period, inOutProcessed, salary);

  return {
    ot,
    otReason,
    noPay,
    noPayReason,
    inOutProcessed: processedInOut,
  };
};

// No overtime calculation
const noOtCalc = (
  employee: any,
  period: string,
  inOutProcessed: ProcessedInOut | RawInOut,
  salary: any
) => {
  let {
    inOutProcessed: processedInOut,
    ot,
    noPay,
    otReason,
    noPayReason,
  } = inOutProcess(employee, period, inOutProcessed, salary);

  return {
    ot,
    otReason,
    noPay,
    noPayReason,
    inOutProcessed: processedInOut,
  };
};

// Overtime calculation
const OtCalc = (
  employee: any,
  period: string,
  inOutProcessed: ProcessedInOut | RawInOut,
  salary: any
) => {
  let {
    inOutProcessed: processedInOut,
    ot,
    noPay,
    otReason,
    noPayReason,
  } = inOutProcess(employee, period, inOutProcessed, salary);
  return {
    ot,
    otReason,
    noPay,
    noPayReason,
    inOutProcessed: processedInOut,
  };
};
