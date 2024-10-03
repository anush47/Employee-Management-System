import Employee from "@/app/models/Employee";
import Salary from "@/app/models/Salary";
import { inOutGen, inOutProcess } from "../inOutProcessing";

// Helper function to parse the value for additions/deductions
function parseValue(name: string, value: string, basic: number): number {
  if (name === "EPF 8%") {
    return basic * 0.08;
  } else if (value && value.includes("-")) {
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

function generateObjectId(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16); // 4-byte timestamp in hex
  const randomPart = Math.random().toString(16).substr(2, 10); // 5-byte random hex string
  const counter = Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0"); // 3-byte counter

  return timestamp + randomPart + counter;
}

export async function generateSalaryForOneEmployee(
  employee: any,
  period: string,
  inOut: string[] | undefined
) {
  try {
    // Calculate additions with actual computed values
    const parsedAdditions = employee.paymentStructure.additions.map(
      (addition: { name: string; amount: string }) => ({
        name: addition.name,
        amount: parseValue(addition.name, addition.amount, employee.basic), // Store the computed value
      })
    );

    // Calculate deductions with actual computed values
    const parsedDeductions = employee.paymentStructure.deductions.map(
      (deduction: { name: string; amount: string }) => ({
        name: deduction.name,
        amount: parseValue(deduction.name, deduction.amount, employee.basic), // Store the computed value
      })
    );

    // Calculate total additions and deductions
    const totalAdditions = parsedAdditions.reduce(
      (total: number, addition: { amount: number }) => total + addition.amount,
      0
    );

    const totalDeductions = parsedDeductions.reduce(
      (total: number, deduction: { amount: number }) =>
        total + deduction.amount,
      0
    );

    let ot = 0;
    let noPay = 0;
    let otReason = "";
    let noPayReason = "";
    let inOutProcessed: {
      in: Date;
      out: Date;
      workingHours: number;
      otHours: number;
      ot: number;
      noPay: number;
      holiday: string;
      description: string;
    }[] = [];

    //sort inOut
    inOut = inOut?.sort() || [];

    switch (employee.otMethod) {
      case "noOt":
        ({ ot, otReason, noPay, noPayReason, inOutProcessed } = noOtCalc(
          employee,
          period,
          inOut
        ));
        break;
      case "calc":
        ({ ot, otReason, noPay, noPayReason, inOutProcessed } = OtCalc(
          employee,
          period,
          inOut
        ));
        break;
      default:
        ({ ot, otReason, noPay, noPayReason, inOutProcessed } = randomCalc(
          employee,
          period,
          inOut
        ));
        break;
    }

    // Generate the salary data
    const salaryData = {
      _id: generateObjectId(),
      inOut: inOutProcessed,
      employee: employee._id,
      period,
      basic: employee.basic, // Employee's basic salary
      noPay: {
        amount: 1000, // Example: No Pay deduction amount
        reason: noPayReason, // Example reason for no pay
      },
      ot: {
        amount: ot, // Example: Overtime payment
        reason: otReason, // Example reason for overtime
      },
      paymentStructure: {
        additions: parsedAdditions, // Return the parsed additions with computed values
        deductions: parsedDeductions, // Return the parsed deductions with computed values
      },
      advanceAmount: 0, // Example advance amount
      finalSalary:
        employee.basic + totalAdditions + ot - totalDeductions - noPay, // Calculating final salary
    };
    return salaryData;
  } catch (error) {
    return {
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

const randomCalc = (employee: any, period: string, inOut: string[] = []) => {
  let { inOutProcessed, ot, noPay, otReason, noPayReason } = inOutGen(
    employee,
    period,
    inOut
  );

  return {
    ot,
    otReason,
    noPay,
    noPayReason,
    inOutProcessed,
  };
};

const noOtCalc = (employee: any, period: string, inOut: string[] = []) => {
  let { inOutProcessed, ot, noPay, otReason, noPayReason } = inOutProcess(
    employee,
    period,
    inOut
  );

  return {
    ot,
    otReason,
    noPay,
    noPayReason,
    inOutProcessed,
  };
};

const OtCalc = (employee: any, period: string, inOut: string[] = []) => {
  let { inOutProcessed, ot, noPay, otReason, noPayReason } = inOutProcess(
    employee,
    period,
    inOut
  );
  return {
    ot,
    otReason,
    noPay,
    noPayReason,
    inOutProcessed,
  };
};
