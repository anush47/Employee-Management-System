import {
  generateSalaryWithInOut,
  processSalaryWithInOut,
} from "../salaryProcessing";

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
  remark: string;
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
    totalSalary: number;
  },
  salary: { noPay: { amount: number } },
  ot: number
) {
  let parsedAdditions = source.paymentStructure.additions.map(
    (addition: { name: string; amount: string }) => ({
      name: addition.name,
      amount: parseValue(addition.name, addition.amount, source.basic),
    })
  );

  let parsedDeductions = source.paymentStructure.deductions.reduce(
    (
      acc: { name: string; amount: number }[],
      deduction: { name: string; amount: string }
    ) => {
      if (deduction && deduction.name !== "EPF 8%") {
        acc.push({
          name: deduction.name,
          amount: parseValue(deduction.name, deduction.amount, source.basic),
        });
      }
      return acc;
    },
    []
  );

  if (source.totalSalary > 0) {
    const getFilteredAdditionsAndDeductions = () => {
      const additionsWithRanges = source.paymentStructure.additions.filter(
        (addition) =>
          typeof addition.amount === "string" && addition.amount.includes("-")
      );

      // get the additions with null or ""
      const additionsWithNull = source.paymentStructure.additions.filter(
        (addition) => addition.amount === null || addition.amount === ""
      );

      // get the deductions with ranges
      const deductionsWithRanges = source.paymentStructure.deductions.filter(
        (deduction) =>
          typeof deduction.amount === "string" &&
          deduction.amount.includes("-") &&
          deduction.name !== "EPF 8%"
      );

      // get the deductions with null or ""
      const deductionsWithNull = source.paymentStructure.deductions.filter(
        (deduction) =>
          (deduction.amount === null || deduction.amount === "") &&
          deduction.name !== "EPF 8%"
      );

      return {
        additionsWithRanges,
        additionsWithNull,
        deductionsWithRanges,
        deductionsWithNull,
      };
    };

    const {
      additionsWithRanges,
      additionsWithNull,
      deductionsWithRanges,
      deductionsWithNull,
    } = getFilteredAdditionsAndDeductions();

    const amountNeeded =
      Number(source.totalSalary) - ot - source.basic - source.basic * 0.08;
    console.log(source.totalSalary, amountNeeded);

    //change the  parsedAdditions and parsedDeductions in additions with range, null to 0
    parsedAdditions = parsedAdditions.map((addition) => {
      if (
        additionsWithRanges.some((range) => range.name === addition.name) ||
        additionsWithNull.some(
          (nullAddition) => nullAddition.name === addition.name
        )
      ) {
        return { ...addition, amount: 0 };
      }
      return addition;
    });
    parsedDeductions = parsedDeductions.map((deduction) => {
      if (
        deductionsWithRanges.some((range) => range.name === deduction.name) ||
        deductionsWithNull.some(
          (nullDeduction) => nullDeduction.name === deduction.name
        )
      ) {
        return { ...deduction, amount: 0 };
      }
      return deduction;
    });

    //calculate additions and deductions to
    const totalAdditions = parsedAdditions.reduce(
      (total: number, addition: { amount: number }) => total + addition.amount,
      0
    );
    const totalDeductions = parsedDeductions.reduce(
      (total: number, deduction: { amount: number } | undefined) =>
        total + (deduction ? deduction.amount : 0),
      0
    );

    let adjustmentRequired = amountNeeded - (totalAdditions - totalDeductions);
    console.log(adjustmentRequired, "adjustmentRequired");

    // if amountNeeded > 0
    if (adjustmentRequired > 0) {
      // Add adjustment to additions with specified ranges
      additionsWithRanges.forEach((addition) => {
        const [min, max] = addition.amount.split("-").map(Number);

        parsedAdditions.forEach((parsedAddition) => {
          if (parsedAddition.name === addition.name) {
            // Skip if adjustment is below 100
            if (Math.abs(adjustmentRequired) < 100) {
              return;
            }

            // Calculate new amount within range and adjust
            let newAmount = Math.min(
              max,
              Math.round((min + adjustmentRequired) / 100) * 100
            );
            let difference = newAmount - parsedAddition.amount;

            // Apply only if adjustmentRequired allows it
            if (difference <= adjustmentRequired) {
              adjustmentRequired -= difference;
              parsedAddition.amount = newAmount;
            }
          }
        });
      });

      // Add adjustment to deductions with specified ranges
      deductionsWithRanges.forEach((deduction) => {
        const [min, max] = deduction.amount.split("-").map(Number);

        parsedDeductions.forEach((parsedDeduction) => {
          if (parsedDeduction.name === deduction.name) {
            if (Math.abs(adjustmentRequired) < 100) {
              return;
            }

            let newAmount = Math.max(
              min,
              Math.round((max - adjustmentRequired) / 100) * 100
            );
            let difference = parsedDeduction.amount - newAmount;

            // Apply only if adjustmentRequired allows it
            if (difference <= adjustmentRequired) {
              adjustmentRequired -= difference;
              parsedDeduction.amount = newAmount;
            }
          }
        });
      });

      console.log(adjustmentRequired, "adjustmentRequired after");

      // Calculate total number of null additions/deductions to adjust
      const totalNullToAdjust =
        additionsWithNull.length + deductionsWithNull.length;

      // Generate values for adjustment with slight variation
      const baseValue = adjustmentRequired / totalNullToAdjust;
      const generateCenteredSequence = (total: number) =>
        Array.from(
          { length: total },
          (_, i) =>
            i -
            Math.floor(total / 2) +
            (total % 2 === 0 && i >= total / 2 ? 1 : 0)
        );
      const valuesToAdjust = generateCenteredSequence(totalNullToAdjust).map(
        (i) => {
          const variation = i * (baseValue * 0.1); // 10% variation
          return Math.round((baseValue + variation) / 100) * 100;
        }
      );

      console.log(valuesToAdjust, "valuesToAdjust");
      console.log(adjustmentRequired, "adjustmentRequired");

      // Adjust additions with null values
      additionsWithNull.forEach((addition) => {
        parsedAdditions.forEach((parsedAddition) => {
          if (parsedAddition.name === addition.name) {
            if (Math.abs(adjustmentRequired) < 100) {
              return;
            }

            let newAmount = valuesToAdjust.shift();
            if (newAmount !== undefined) {
              adjustmentRequired -= newAmount - Number(parsedAddition.amount);
              parsedAddition.amount = newAmount;
            }
          }
        });
      });

      // Adjust deductions with null values
      deductionsWithNull.forEach((deduction) => {
        parsedDeductions.forEach((parsedDeduction) => {
          if (parsedDeduction.name === deduction.name) {
            let newAmount = valuesToAdjust.shift();
            if (newAmount !== undefined) {
              adjustmentRequired += newAmount - Number(parsedDeduction.amount);
              parsedDeduction.amount = newAmount;
            }
          }
        });
      });

      // Final debugging logs
      console.log(adjustmentRequired, "remaining adjustmentRequired");
      console.log(parsedAdditions);
      console.log(parsedDeductions);
    }
  }

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
  } else if (
    value === "" ||
    value === undefined ||
    value === null ||
    isNaN(Number(value))
  ) {
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

    source.totalSalary = parseValue("totalSalary", employee.totalSalary, 0);

    //if totalSalary then parse totalSalary to number
    if (source.totalSalary && source.totalSalary !== "") {
      source.totalSalary = parseValue(
        "totalSalary",
        source.totalSalary,
        source.basic
      );
    }

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
        ({ ot, otReason, noPay, noPayReason, inOutProcessed } = await noOtCalc(
          employee,
          period,
          inOutProcessed,
          salary
        ));
        break;
      case "calc":
        ({ ot, otReason, noPay, noPayReason, inOutProcessed } = await OtCalc(
          employee,
          period,
          inOutProcessed,
          salary
        ));
        break;
      default:
        ({ ot, otReason, noPay, noPayReason, inOutProcessed } =
          await randomCalc(employee, period, inOutProcessed, salary));
        break;
    }

    const {
      parsedAdditions,
      parsedDeductions,
      totalAdditions,
      totalDeductions,
    } = calculateSalaryDetails(source, salary, ot);

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

    //console.log(salaryData.paymentStructure.additions);

    return salaryData;
  } catch (error) {
    return {
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

// Random overtime calculation
const randomCalc = async (
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
  } = await generateSalaryWithInOut(employee, period, inOutProcessed, salary);

  return {
    ot,
    otReason,
    noPay,
    noPayReason,
    inOutProcessed: processedInOut,
  };
};

// No overtime calculation
const noOtCalc = async (
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
  } = await processSalaryWithInOut(employee, period, inOutProcessed, salary);

  return {
    ot,
    otReason,
    noPay,
    noPayReason,
    inOutProcessed: processedInOut,
  };
};

// Overtime calculation
const OtCalc = async (
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
  } = await processSalaryWithInOut(employee, period, inOutProcessed, salary);
  return {
    ot,
    otReason,
    noPay,
    noPayReason,
    inOutProcessed: processedInOut,
  };
};
