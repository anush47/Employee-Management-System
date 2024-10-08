import { ProcessedInOut, RawInOut } from "./generate/salaryGeneration";

// Helper function to parse and validate a date string
const parseDate = (time: string): Date | null => {
  const utcTime = `${time}Z`;
  const parsedDate = Date.parse(utcTime);

  if (isNaN(parsedDate)) {
    console.error(`Invalid date format: ${time}`);
    return null;
  }

  return new Date(parsedDate);
};

// Main function to process inOut CSV data
export const initialInOutProcess = (data: string | ProcessedInOut) => {
  //if type is not string return as it is
  if (typeof data !== "string") {
    return data;
  }
  // Split the CSV data into lines and ignore the header
  const rows = data.trim().split("\n").slice(1);
  const result: { [employeeId: string]: RawInOut } = {};

  // Process each row
  rows.forEach((row) => {
    const [employeeId, time] = row.split(",").map((cell) => cell.trim()); // Extract employee ID and time
    const parsedDate = parseDate(time);

    if (parsedDate) {
      // Initialize the employee entry if it does not exist
      if (!result[employeeId]) {
        result[employeeId] = [];
      }

      // Add the timestamp to the employee's array
      result[employeeId].push(parsedDate);
    }
  });

  // Return the structured result
  return result;
};
