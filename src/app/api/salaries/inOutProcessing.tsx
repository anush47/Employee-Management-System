export const inOutProcess = (
  employee: any,
  period: string,
  inOut: string[] // Array of date-time strings
) => {
  const { shifts, workingDays, basic, divideBy } = employee;

  const { startDate, endDate } = startEndDates(period, inOut);

  const records: {
    in: Date;
    out: Date;
    workingHours: number;
    otHours: number;
    ot: number;
    noPay: number;
    holiday: string;
    description: string;
  }[] = [];
  let day = new Date(startDate);
  let inOutIndex = 0;

  // Iterate through each day in the period
  while (day <= endDate) {
    // Iterate through each inOut record
    while (
      inOutIndex < inOut.length &&
      new Date(inOut[inOutIndex]) <= endDate
    ) {
      // Get the in Time
      let inDate = new Date(inOut[inOutIndex]);

      // Check for shifts starting within 3 hours of inDate's time
      const shift = shifts.find((shift: { start: string; end: string }) => {
        return (
          Math.abs(getTimeDifferenceInMinutes(shift.start, inDate)) <= 3 * 60
        ); // Allow 3 hours variation in minutes
      });

      if (!shift) {
        console.log(
          "No shift found for the given time: " + inDate.toISOString()
        );
        inOutIndex++;
        continue; // Move to the next inOut record
      }

      // Move to the next inOut record for out time
      inOutIndex++;

      // Get the out Time
      let outDate: Date | null = null;

      // Check if out of bound
      if (inOutIndex >= inOut.length) {
        console.log(
          "No out time found for the given in time: " + inDate.toISOString()
        );
        outDate = getShiftEnd(shift.end, inDate); // Default to shift end time
      } else {
        // Check if the next date is in the variation of end time of 8 hrs
        outDate = new Date(inOut[inOutIndex]);
        if (
          Math.abs(getTimeDifferenceInMinutes(shift.end, outDate)) >
          3 * 60 // Allow 8 hours variation in minutes
        ) {
          console.log(
            "Out time is not in the variation of end time of 8 hrs: " +
              outDate.toISOString()
          );
          outDate = getShiftEnd(shift.end, inDate); // Default to shift end time
        } else {
          // Move to next inOut index if valid out time
          inOutIndex++;
        }
      }

      //calculations
      const workingHours =
        (outDate.getTime() - inDate.getTime()) / 1000 / 60 / 60;

      // Add processed record to records
      records.push({
        in: inDate, // Record the in time
        out: outDate, // Record the out time
        workingHours,
        otHours: 0,
        ot: 0,
        noPay: 0,
        holiday: "",
        description: "",
      });
      day.setUTCDate(outDate.getUTCDate() + 1);
    }
    // End of inOutIndex while loop

    // Move to the next day
    // records.push({
    //   in: new Date(day),
    //   out: new Date(day),
    // });
    day.setUTCDate(day.getUTCDate() + 1);
  }

  const ot = 0;
  const otReason = "no OT";
  const noPay = 1000;
  const noPayReason = "Unapproved leaves";
  return {
    inOutProcessed: records,
    ot,
    otReason,
    noPay,
    noPayReason,
  };
};

export const inOutGen = (employee: any, period: any, inOut: any) => {
  const inOutProcessed: {
    in: Date;
    out: Date;
    workingHours: number;
    otHours: number;
    ot: number;
    noPay: number;
    holiday: string;
    description: string;
  }[] = [];
  inOutProcessed.push(
    {
      in: new Date("2024-09-30T08:10:00"),
      out: new Date("2024-09-30T17:05:00"),
      workingHours: 0,
      otHours: 0,
      ot: 0,
      noPay: 0,
      holiday: "",
      description: "",
    },
    {
      in: new Date("2024-09-30T07:55:00"),
      out: new Date("2024-09-30T17:10:00"),
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

const startEndDates = (
  period: string | number | Date,
  inOut: (string | number | Date)[]
) => {
  const periodStartDate = new Date(period);
  const inOutStartDate = new Date(inOut[0]);
  let startDate = new Date();
  const halfMonthInMillis = (30 * 24 * 60 * 60 * 1000) / 2; // Approximate half month in milliseconds
  if (
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
  // If shift endtime is before start move to next day
  if (shiftEndTime < inDate) {
    shiftEndTime.setUTCDate(shiftEndTime.getUTCDate() + 1);
  }
  return shiftEndTime;
};

// Helper function to get time Difference of shift and inOut
const getTimeDifferenceInMinutes = (shift: string, inOut: Date): number => {
  const [hours, minutes] = shift.split(":").map(Number);
  // Check time difference in minutes without converting to date
  const timeDiff =
    hours * 60 + minutes - (inOut.getUTCHours() * 60 + inOut.getUTCMinutes());
  return timeDiff;
};

// export const otCalc = (employee, period, inOutProcessed) => {
//   //for each record add otHours,
// };
