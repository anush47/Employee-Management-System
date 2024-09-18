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
    // If the value is empty or not a number, set a random value based on basic salary (e.g., 5% to 15% of basic)
    const randomValue = Math.floor(Math.random() * 0.1 * basic + 0.05 * basic);
    return randomValue;
  } else {
    // Otherwise, it's a fixed value like "3000", so parse it as a number
    return Number(value);
  }
}

export async function generateSalaryForOneEmployee(
  employee: any,
  period: string,
  data: string | undefined
) {
  try {
    // Calculate total additions and deductions by parsing each value
    const totalAdditions = employee.paymentStructure.additions.reduce(
      (total: number, addition: { name: string; amount: string }) =>
        total + parseValue(addition.amount, employee.basic),
      0
    );

    const totalDeductions = employee.paymentStructure.deductions.reduce(
      (total: number, deduction: { name: string; amount: string }) =>
        total + parseValue(deduction.amount, employee.basic),
      0
    );

    // Generate the salary data
    const salaryData = {
      employee: employee._id,
      period,
      basic: employee.basic, // Employee's basic salary
      noPay: {
        amount: 1000, // Example: No Pay deduction amount
        reason: "Unapproved leaves", // Example reason for no pay
      },
      ot: {
        amount: 5000, // Example: Overtime payment
        reason: "Extra work hours", // Example reason for overtime
      },
      paymentStructure: employee.paymentStructure, // Use the employee's payment structure
      advanceAmount: 3000, // Example advance amount
      finalSalary:
        employee.basic + totalAdditions + 5000 - totalDeductions - 1000 - 3000, // Calculating final salary
    };

    return salaryData;
  } catch (error) {
    return {
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
