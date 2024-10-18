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
    workingDayStatus = "full",
    holiday = "",
    noPay = 0,
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

      const workingDayStatus = getWorkingDayStatus(inDate, employee);

      // Recalculate using the reusable function
      processRecord(
        inDate,
        outDate,
        workingDayStatus,
        record.holiday,
        record.noPay,
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
          const timeDifference = getTimeDifferenceInMinutes(shift.end, outDate);
          if (
            (timeDifference >= 0 && timeDifference < 6 * 60) || // Allow 6 hours after shift end
            (timeDifference < 0 &&
              getTimeDifferenceInMinutes(shift.in, outDate) > 0 &&
              timeDifference >= -3 * 60) // Allow before shift end upto shift start
          ) {
            outDate = getShiftEnd(shift.end, inDate); // Default to shift end time
          } else {
            inOutIndex++;
          }
        }

        const workingDayStatus = getWorkingDayStatus(inDate, employee);
        const holiday = getHolidayStatus(day);

        // Use the reusable function to process the record
        processRecord(inDate, outDate, workingDayStatus, holiday);
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
  period: string,
  inOut: RawInOut | ProcessedInOut,
  existingSalary: any = undefined
) => {
  const { shifts } = employee;

  const generateRandomRecord = (day: Date) => {
    const workingDayStatus = getWorkingDayStatus(day, employee);
    const shift = shifts[Math.floor(Math.random() * shifts.length)];
    const holidayStatus = getHolidayStatus(day);
    const inDate = new Date(day);
    const inVaryEarlyMax = 60; // maximum early time in minutes
    const inVaryLateMax = 30; // maximum late time in minutes
    const randomInOffset =
      Math.random() < 0.9
        ? -Math.random() * inVaryEarlyMax
        : Math.random() * inVaryLateMax; // 90% chance to be earlier
    inDate.setUTCHours(
      Number(shift.start.split(":")[0]),
      Number(shift.start.split(":")[1])
    );
    inDate.setUTCMinutes(inDate.getUTCMinutes() + randomInOffset);

    const outVaryEarlyMax = 30; // maximum early time in minutes
    const outVaryLateMax = 60 * 4; // maximum late time in minutes
    const randomOutOffset =
      Math.random() < 0.1
        ? -Math.random() * outVaryEarlyMax
        : Math.random() * outVaryLateMax; // 10% chance to be earlier
    const outDate = new Date(day);
    outDate.setUTCHours(
      Number(shift.end.split(":")[0]),
      Number(shift.end.split(":")[1])
    );
    outDate.setUTCMinutes(outDate.getUTCMinutes() + randomOutOffset);
    return {
      in: inDate.toISOString(),
      out: outDate.toISOString(),
      workingHours: 0,
      otHours: 0,
      ot: 0,
      noPay: 0,
      holiday: holidayStatus,
      description: "",
    };
  };

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
  //process existing
  const existingProcessed = inOutProcess(
    employee,
    period,
    inOut,
    existingSalary
  );

  //push existing
  existingProcessed.inOutProcessed.forEach((record) => {
    inOutProcessed.push(record);
  });

  //get start end days
  const { startDate, endDate } = startEndDates(period, inOut as Date[]);
  let day = new Date(startDate);

  //generate random records for records that are not available
  while (day <= endDate) {
    if (
      !inOutProcessed.find(
        (record) => new Date(record.in).getUTCDate() === day.getUTCDate()
      )
    ) {
      inOutProcessed.push(generateRandomRecord(day));
    }
    day.setUTCDate(day.getUTCDate() + 1);
  }

  //sort correctly
  inOutProcessed.sort((a, b) => {
    return new Date(a.in).getTime() - new Date(b.in).getTime();
  });

  //reprocress all inouts
  const reprocessed = inOutProcess(employee, period, inOutProcessed);
  return reprocessed;
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

const getHolidayStatus = (day: Date): string => {
  // Check if the day is a holiday
  return "";
};

const getWorkingDayStatus = (
  day: Date,
  employee: any
): "full" | "half" | "off" => {
  const dayOfWeek = day
    .toLocaleDateString("en-US", { weekday: "short" })
    .toLowerCase(); // mon, tue, wed, etc.
  const workingDayStatus = employee.workingDays[dayOfWeek] || "full"; // full, half, off

  return workingDayStatus;
};
