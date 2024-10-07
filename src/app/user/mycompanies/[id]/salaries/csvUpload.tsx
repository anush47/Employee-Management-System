import dayjs from "dayjs";
import { Salary } from "./salariesDataGrid";

export const handleCsvUpload = async (file: File): Promise<string> => {
  try {
    const reader = new FileReader();

    const result = await new Promise<string>((resolve, reject) => {
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result.toString());
        } else {
          reject(new Error("Failed to read the file content"));
        }
      };

      reader.onerror = () => {
        reject(new Error("An error occurred while reading the file"));
      };

      reader.readAsText(file);
    });

    // Send to API to process inOut
    console.log(result);

    return result;
  } catch (error) {
    console.error("Error during file upload or processing:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "An unexpected error occurred during file upload or processing"
    );
  }
};

export const inOutCalc = (salary: Salary, divideBy: number) => {
  let ot = 0;
  let noPay = 0;
  let otReason = "";
  let noPayReason = "";
  let totalNormalOtHours = 0;

  salary.inOut.forEach(
    (record: {
      in: string;
      out: string;
      workingHours: number;
      otHours: number;
      ot: number;
      noPay: number;
      holiday: string;
      description: string;
    }) => {
      // Calculate working hours
      const _workingHours = dayjs(record.out).diff(
        dayjs(record.in),
        "hour",
        true
      );
      record.workingHours = _workingHours;

      // Check for holiday work
      if (record.holiday && record.holiday === "double") {
        // Assign double OT for holiday work
        record.otHours = _workingHours;
        record.ot = record.otHours * 200; // Assuming double OT rate on holidays
        ot += record.ot;
        otReason += `Worked on holiday (${record.holiday}), double OT applied. `;
      } else if (_workingHours > 8) {
        // Calculate normal OT and double OT
        const normalOtHours = Math.min(_workingHours - 8, 2); // First 2 hours are normal OT
        const doubleOtHours = _workingHours > 10 ? _workingHours - 10 : 0; // Beyond 10 hours is double OT

        // Normal OT calculation
        if (normalOtHours > 0) {
          record.otHours = normalOtHours;
          record.ot = normalOtHours * 100; // Assuming 100 per OT hour
          ot += record.ot;
          totalNormalOtHours += normalOtHours; // Add to total normal OT hours
        }

        // Double OT calculation
        if (doubleOtHours > 0) {
          const doubleOt = doubleOtHours * 200; // Assuming double OT rate is 200 per hour
          record.ot += doubleOt;
          ot += doubleOt;
          otReason += `Double OT for ${doubleOtHours.toFixed(2)} hour(s). `;
        }
      }
    }
  );

  // Only add normal OT reason if any normal OT hours exist
  if (totalNormalOtHours > 0) {
    otReason += `Normal OT for a total of ${totalNormalOtHours.toFixed(
      2
    )} hour(s). `;
  }

  return {
    ot: parseFloat(ot.toFixed(2)), // Ensure ot has 2 decimal places
    noPay: parseFloat(noPay.toFixed(2)), // Ensure noPay has 2 decimal places
    otReason: otReason.trim(),
    noPayReason,
  };
};

export const inOutCalcOne = (
  record: {
    in: string;
    out: string;
    workingHours: number;
    otHours: number;
    ot: number;
    noPay: number;
    holiday: string;
    description: string;
  },
  basic: number,
  divideBy: number
) => {
  // Calculate working hours
  const _workingHours = dayjs(record.out).diff(dayjs(record.in), "hour", true);
  record.workingHours = _workingHours;

  // Check for holiday work
  if (record.holiday && record.holiday === "double") {
    // Assign double OT for holiday work
    record.otHours = _workingHours;
    record.ot = (record.otHours * basic) / divideBy; // Assuming double OT rate on holidays
  } else if (_workingHours > 8) {
    // Calculate normal OT and double OT
    const normalOtHours = Math.min(_workingHours - 8, 2); // First 2 hours are normal OT
    const doubleOtHours = _workingHours > 10 ? _workingHours - 10 : 0; // Beyond 10 hours is double OT

    // Normal OT calculation
    if (normalOtHours > 0) {
      record.otHours = normalOtHours;
      record.ot = (normalOtHours * basic) / divideBy; // Assuming 100 per OT hour
    }

    // Double OT calculation
    if (doubleOtHours > 0) {
      record.ot += (doubleOtHours * 2 * basic) / divideBy; // Assuming double OT rate is 200 per hour
    }
  }

  return record;
};
