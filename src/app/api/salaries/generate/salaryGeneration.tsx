import Employee from "@/app/models/Employee";
import Salary from "@/app/models/Salary";

// Helper function to parse the value for additions/deductions
function parseValue(value: string, basic: number): number {
  if (value.includes("-")) {
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

export async function generateSalaryForOneEmployee(
  employee: any,
  period: string,
  inOut: string | undefined
) {
  try {
    // Calculate additions with actual computed values
    const parsedAdditions = employee.paymentStructure.additions.map(
      (addition: { name: string; amount: string }) => ({
        name: addition.name,
        amount: parseValue(addition.amount, employee.basic), // Store the computed value
      })
    );

    // Calculate deductions with actual computed values
    const parsedDeductions = employee.paymentStructure.deductions.map(
      (deduction: { name: string; amount: string }) => ({
        name: deduction.name,
        amount: parseValue(deduction.amount, employee.basic), // Store the computed value
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

    switch (employee.otMethod) {
      case "noOt":
        ({ ot, otReason, noPay, noPayReason } = noOtCalc(
          employee,
          period,
          inOut
        ));
        break;
      case "calc":
        ({ ot, otReason, noPay, noPayReason } = OtCalc(
          employee,
          period,
          inOut
        ));
        break;
      default:
        ({ ot, otReason, noPay, noPayReason } = randomCalc(
          employee,
          period,
          inOut
        ));
        break;
    }

    // Generate the salary data
    const salaryData = {
      inOut,
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

const randomCalc = (
  employee: any,
  period: string,
  inOut: string | undefined
) => {
  let ot = 5000;
  let noPay = 1000;
  let otReason = "Random";
  let noPayReason = "Unapproved leaves";

  return {
    ot,
    otReason,
    noPay,
    noPayReason,
  };
};

const noOtCalc = (employee: any, period: string, inOut: string | undefined) => {
  let ot = 0;
  let noPay = 1000;
  let otReason = "no OT";
  let noPayReason = "Unapproved leaves";

  return {
    ot,
    otReason,
    noPay,
    noPayReason,
  };
};

const OtCalc = (employee: any, period: string, inOut: string | undefined) => {
  let ot = 7000;
  let noPay = 1000;
  let otReason = "Calculated OT";
  let noPayReason = "Unapproved leaves";

  return {
    ot,
    otReason,
    noPay,
    noPayReason,
  };
};
