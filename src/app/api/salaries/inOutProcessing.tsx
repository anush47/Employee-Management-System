// Determine if inOut contains already processed records (objects) or unprocessed Dates
import { ProcessedInOut, RawInOut } from "./generate/salaryGeneration";

export const inOutProcess = (
  employee: any,
  period: string,
  inOut: RawInOut | ProcessedInOut,
  existingSalary: any = undefined
) => {
  const { shifts } = employee;
  const source = existingSalary || employee;

  // Determine if inOut contains already processed records (objects) or unprocessed Dates
  const isProcessed =
    (inOut as ProcessedInOut) !== undefined &&
    (inOut as ProcessedInOut)[0].in !== undefined;

  const records: {
    in: string;
    out: string;
    workingHours: number;
    otHours: number;
    ot: number;
    noPay: number;
    holiday: string;
    description: string;
  }[] = [];

  // Reusable function to calculate working hours, OT, and other fields
  const processRecord = (
    inDate: Date,
    outDate: Date,
    noPay = 0,
    holiday = "",
    description = ""
  ) => {
    const workingHours =
      (outDate.getTime() - inDate.getTime()) / 1000 / 60 / 60;
    let otHours = 0;
    if (workingHours > 8) {
      otHours = workingHours - 8;
    }
    const ot = otHours > 0 ? (otHours * source.basic) / employee.divideBy : 0; // Example OT rate

    records.push({
      in: inDate.toISOString(),
      out: outDate.toISOString(),
      workingHours,
      otHours,
      ot,
      noPay,
      holiday,
      description,
    });
  };

  if (isProcessed) {
    // Process the already processed records
    (inOut as any[]).forEach((record: any) => {
      const inDate = new Date(record.in);
      const outDate = new Date(record.out);

      // Recalculate using the reusable function
      processRecord(
        inDate,
        outDate,
        record.noPay,
        record.holiday,
        record.description
      );
    });
  } else {
    // Unprocessed, proceed to process Date[] input
    const { startDate, endDate } = startEndDates(period, inOut as Date[]);

    let day = new Date(startDate);
    let inOutIndex = 0;

    // Iterate through each day in the period
    while (day <= endDate) {
      // Iterate through each inOut record
      while (
        inOut &&
        inOutIndex < inOut.length &&
        (inOut[inOutIndex] as Date) <= endDate
      ) {
        let inDate = inOut[inOutIndex] as Date;

        const shift = shifts.find((shift: { start: string; end: string }) => {
          return (
            Math.abs(getTimeDifferenceInMinutes(shift.start, inDate)) <= 3 * 60
          ); // Allow 3 hours variation in minutes
        });

        if (!shift) {
          console.log("No shift found for the given time:", inDate);
          inOutIndex++;
          continue; // Move to the next inOut record
        }

        // Move to the next inOut record for out time
        inOutIndex++;

        let outDate: Date | null = null;
        if (inOutIndex >= inOut.length) {
          outDate = getShiftEnd(shift.end, inDate); // Default to shift end time
        } else {
          outDate = inOut[inOutIndex] as Date;
          if (
            Math.abs(getTimeDifferenceInMinutes(shift.end, outDate)) >
            3 * 60
          ) {
            outDate = getShiftEnd(shift.end, inDate); // Default to shift end time
          } else {
            inOutIndex++;
          }
        }

        // Use the reusable function to process the record
        processRecord(inDate, outDate);
        day.setUTCDate(outDate.getUTCDate() + 1);
      }
      day.setUTCDate(day.getUTCDate() + 1);
    }
  }

  const ot = records.reduce((acc, cur) => acc + cur.ot, 0);
  const noPay = records.reduce((acc, cur) => acc + cur.noPay, 0);
  const otReason = "OT recalculated";
  const noPayReason = "Unapproved leaves recalculated";

  return {
    inOutProcessed: records,
    ot,
    otReason,
    noPay,
    noPayReason,
  };
};

export const inOutGen = (
  employee: any,
  period: any,
  inOut: any,
  existingSalary: any = undefined
) => {
  const inOutProcessed: {
    in: string;
    out: string;
    workingHours: number;
    otHours: number;
    ot: number;
    noPay: number;
    holiday: string;
    description: string;
  }[] = [];
  inOutProcessed.push(
    {
      in: new Date("2024-09-30T08:10:00").toISOString(),
      out: new Date("2024-09-30T17:05:00").toISOString(),
      workingHours: 0,
      otHours: 0,
      ot: 0,
      noPay: 0,
      holiday: "",
      description: "",
    },
    {
      in: new Date("2024-09-30T07:55:00").toISOString(),
      out: new Date("2024-09-30T17:10:00").toISOString(),
      workingHours: 0,
      otHours: 0,
      ot: 0,
      noPay: 0,
      holiday: "",
      description: "",
    }
  );
  let ot = 0;
  let noPay = 1000;
  let otReason = "no OT";
  let noPayReason = "Unapproved leaves";
  return { inOutProcessed, ot, otReason, noPay, noPayReason };
};

// Helper functions
const startEndDates = (
  period: string | number | Date,
  inOut: (string | number | Date)[]
) => {
  const periodStartDate = new Date(period);
  const inOutStartDate = inOut ? new Date(inOut[0]) : undefined;
  let startDate = new Date();
  const halfMonthInMillis = (30 * 24 * 60 * 60 * 1000) / 2; // Approximate half month in milliseconds
  if (
    inOutStartDate &&
    inOutStartDate < periodStartDate &&
    periodStartDate.getTime() - inOutStartDate.getTime() <= halfMonthInMillis
  ) {
    startDate = inOutStartDate;
  } else {
    startDate = periodStartDate;
  }
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);
  return { startDate, endDate };
};

const getShiftEnd = (shift: string, inDate: Date): Date => {
  const [hours, minutes] = shift.split(":").map(Number);
  let shiftEndTime = new Date(inDate);
  shiftEndTime.setUTCHours(hours);
  shiftEndTime.setUTCMinutes(minutes);
  // If shift end time is before start, move to the next day
  if (shiftEndTime < inDate) {
    shiftEndTime.setUTCDate(shiftEndTime.getUTCDate() + 1);
  }
  return shiftEndTime;
};

const getTimeDifferenceInMinutes = (shift: string, inOut: Date): number => {
  const [hours, minutes] = shift.split(":").map(Number);
  const timeDiff =
    hours * 60 + minutes - (inOut.getUTCHours() * 60 + inOut.getUTCMinutes());
  return timeDiff;
};
