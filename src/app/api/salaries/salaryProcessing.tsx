// Determine if inOut contains already processed records (objects) or unprocessed Dates
import { getHolidays } from "../holidays/holidayHelper";
import { ProcessedInOut, RawInOut } from "./generate/salaryGeneration";

export const processSalaryWithInOut = async (
  employee: any,
  period: string,
  inOut: RawInOut | ProcessedInOut,
  existingSalary: any = undefined,
  gen: boolean = false
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
    remark: string;
  }[] = [];

  // Reusable function to calculate working hours, OT, and other fields
  const processRecord = (
    inDate: Date,
    outDate: Date,
    workingDayStatus = "full",
    holiday = {
      date: "",
      categories: {
        public: false,
        bank: false,
        mercantile: false,
      },
      summary: "",
    },
    remark = "",
    noPay = 0
  ) => {
    const workingHours =
      (outDate.getTime() - inDate.getTime()) / 1000 / 60 / 60;

    //workingHoursTreshold
    let workingHoursTreshold = 9;
    const { ot, otHours } = calculateOT(
      workingHours,
      workingDayStatus,
      holiday,
      source.basic,
      source.divideBy,
      workingHoursTreshold
    );

    const workingText = (() => {
      if (
        workingHours === 0 &&
        (workingDayStatus === "full" || workingDayStatus === "half") &&
        !holiday.categories.public &&
        !holiday.categories.mercantile
      ) {
        return "Absent";
      }

      if (workingHours > 0) {
        if (
          workingDayStatus === "off" &&
          (holiday.categories.public || holiday.categories.mercantile)
        ) {
          return "Worked on Off Day and Holiday";
        } else if (workingDayStatus === "off") {
          return "Worked on Off Day";
        } else if (holiday.categories.public || holiday.categories.mercantile) {
          return "Worked on Holiday";
        }
      } else if (workingDayStatus === "off") {
        return "Off";
      }

      return "";
    })();
    const newDescription = [holiday.summary.trim(), workingText].join(" ");

    const holidayText = `${holiday.categories.public ? "Public" : ""} ${
      holiday.categories.mercantile ? "Mercantile" : ""
    } ${holiday.categories.bank ? "Bank" : ""}`.trim();

    records.push({
      in: inDate.toISOString(),
      out: outDate.toISOString(),
      workingHours,
      otHours,
      ot,
      noPay,
      holiday: holidayText,
      description: newDescription,
      remark,
    });
  };

  if (isProcessed) {
    const holidays = await getHolidays(
      (inOut as any[])[0].in,
      (inOut as any[])[inOut.length - 1].out
    );
    // Process the already processed records
    (inOut as any[]).forEach((record: any) => {
      const inDate = new Date(record.in);
      const outDate = new Date(record.out);

      const workingDayStatus = getWorkingDayStatus(inDate, employee);
      const holiday = getHoliday(inDate, holidays.holidays);

      // Recalculate using the reusable function
      processRecord(
        inDate,
        outDate,
        workingDayStatus,
        holiday,
        record.remark,
        record.noPay
      );
    });
  } else {
    // Unprocessed, proceed to process Date[] input
    const { startDate, endDate, holidays } = await startEndDates(
      period,
      inOut as Date[]
    );

    let day = new Date(startDate);
    let inOutIndex = 0;

    // Iterate through each day in the period
    while (day <= endDate) {
      let dayHasRecord = false;

      // Iterate through each inOut record
      while (
        inOut &&
        inOutIndex < inOut.length &&
        (inOut[inOutIndex] as Date) <= endDate
      ) {
        let inDate = inOut[inOutIndex] as Date;

        // Check if the current inDate is on the current day
        if (inDate.toDateString() !== day.toDateString()) {
          break; // If the inDate is for a different day, exit the loop to handle missing records
        }

        dayHasRecord = true; // Mark that this day has a record

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
              getTimeDifferenceInMinutes(shift.start, outDate) > 0 &&
              timeDifference >= -3 * 60) // Allow before shift end up to shift start
          ) {
            outDate = getShiftEnd(shift.end, inDate); // Default to shift end time
          } else {
            inOutIndex++;
          }
        }

        const workingDayStatus = getWorkingDayStatus(inDate, employee);
        const holiday = getHoliday(inDate, holidays);

        // Process the record for the current in/out
        processRecord(inDate, outDate, workingDayStatus, holiday);

        // Move to the next day
        day.setUTCDate(outDate.getUTCDate() + 1);
      }

      // If no records exist for this day, create a record with shift start as both in and out times
      if (!dayHasRecord && !gen) {
        const shift = {
          start: "08:00", // Default shift start time
          end: "17:00", // Default shift end time
        };

        if (shift) {
          const inDate = new Date(day); // Mark the in time as the start of the shift

          const workingDayStatus = getWorkingDayStatus(inDate, employee);
          const holiday = getHoliday(inDate, holidays);

          // Process the record for the missing day
          processRecord(inDate, inDate, workingDayStatus, holiday); // Same inDate for both in and out
        }
      }

      // Move to the next day
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
    noPayReason: existingSalary ? existingSalary.noPayReason : noPayReason,
  };
};

export const generateSalaryWithInOut = async (
  employee: any,
  period: string,
  inOut: RawInOut | ProcessedInOut,
  existingSalary: any = undefined
) => {
  const { shifts } = employee;

  const generateRandomRecord = (day: Date) => {
    const workingDayStatus = getWorkingDayStatus(day, employee);
    const shift = shifts[Math.floor(Math.random() * shifts.length)];
    const holidayStatus = getHoliday(day, holidays);

    let present = Math.random() < 0.95 ? true : false; // 98% chance to be present
    const workOnOff = Math.random() < 0.01 ? true : false; // 1% chance to work on off

    let inDate = new Date(day);
    let outDate = new Date(day);

    let randomInOffset = 0;
    let randomOutOffset = 0;

    //if holiday or off
    if (
      workingDayStatus === "off" ||
      holidayStatus.categories.mercantile ||
      holidayStatus.categories.public
    ) {
      if (workOnOff)
        //worked on off
        present = true;
      //did not work on off
      else present = false;
    }

    if (!present) {
      //absent
      inDate.setUTCHours(
        Number(shift.start.split(":")[0]),
        Number(shift.start.split(":")[1])
      );
      outDate.setUTCHours(
        Number(shift.start.split(":")[0]),
        Number(shift.start.split(":")[1])
      );
    } //present
    else {
      //if otmethod random
      if (employee.otMethod === "random") {
        const inVaryEarlyMax = 30; // maximum early time in minutes
        const inVaryLateMax = 30; // maximum late time in minutes
        randomInOffset =
          Math.random() < 0.95
            ? -Math.random() * inVaryEarlyMax
            : Math.random() * inVaryLateMax; // 95% chance to be earlier

        const outVaryEarlyMax = 30; // maximum early time in minutes
        const outVaryLateMax = 60 * 4; // maximum late time in minutes
        randomOutOffset =
          Math.random() < 0.05
            ? -Math.random() * outVaryEarlyMax
            : Math.random() * outVaryLateMax; // 5% chance to go earlier
      }

      //set in time to shift start + offset
      inDate.setUTCHours(
        Number(shift.start.split(":")[0]),
        Number(shift.start.split(":")[1]) + randomInOffset
      );
      //if half day
      if (workingDayStatus === "half") {
        outDate.setUTCHours(
          Number(shift.start.split(":")[0]) + 6,
          Number(shift.start.split(":")[1]) + randomOutOffset
        );
      } else {
        //full day
        outDate.setUTCHours(
          Number(shift.start.split(":")[0]) + 9,
          Number(shift.start.split(":")[1]) + randomOutOffset
        );
      }
    }

    return {
      in: inDate.toISOString(),
      out: outDate.toISOString(),
      workingHours: 0,
      otHours: 0,
      ot: 0,
      noPay: 0,
      holiday: holidayStatus.summary,
      description: "",
      remark: "",
    };
  };

  let inOutProcessed: {
    in: string;
    out: string;
    workingHours: number;
    otHours: number;
    ot: number;
    noPay: number;
    holiday: string;
    description: string;
    remark: string;
  }[] = [];
  //process existing
  const existingProcessed = await processSalaryWithInOut(
    employee,
    period,
    inOut,
    existingSalary,
    true
  );

  //push existing
  existingProcessed.inOutProcessed.forEach((record) => {
    inOutProcessed.push(record);
  });

  //get start end days
  const { startDate, endDate, holidays } = await startEndDates(
    period,
    inOut as Date[]
  );
  let day = new Date(startDate);

  //generate random records for records that are not available
  while (day <= endDate) {
    if (
      !inOutProcessed.find(
        (record) => new Date(record.in).getUTCDate() === day.getUTCDate()
      )
    ) {
      const generatedRecord = generateRandomRecord(day);
      if (generatedRecord) inOutProcessed.push(generatedRecord);
    }
    day.setUTCDate(day.getUTCDate() + 1);
  }

  //sort correctly
  inOutProcessed.sort((a, b) => {
    return new Date(a.in).getTime() - new Date(b.in).getTime();
  });

  //reprocress all inouts
  const reprocessed = await processSalaryWithInOut(
    employee,
    period,
    inOutProcessed
  );
  return reprocessed;
};

// Helper functions
const startEndDates = async (
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

  //holidays
  //transform to yyyy-mm-dd for holidays
  const startDateHoliday = startDate.toISOString().split("T")[0];
  const endDateHoliday = endDate.toISOString().split("T")[0];
  const holidayResponse = await getHolidays(startDateHoliday, endDateHoliday);
  if (!holidayResponse.holidays && holidayResponse.messege) {
    throw new Error(holidayResponse.messege);
  }

  const { holidays } = holidayResponse;
  return { startDate, endDate, holidays };
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

const getHoliday = (
  date: Date,
  holidays: {
    date: string;
    categories: { public: boolean; bank: boolean; mercantile: boolean };
    summary: string;
  }[]
) => {
  const dateString = date.toISOString().split("T")[0];
  const holiDay = holidays.find((h) => h.date === dateString) || {
    date: dateString,
    categories: { public: false, bank: false, mercantile: false },
    summary: "",
  };
  return holiDay;
};

const calculateOT = (
  workingHours: number,
  workingDayStatus: string,
  holiday: {
    date: string;
    categories: { public: boolean; bank: boolean; mercantile: boolean };
    summary: string;
  },
  basic: number,
  divideBy: number,
  //workingHoursTreshold
  workingHoursTreshold: number = 9
) => {
  if (workingHours === 0) {
    return {
      ot: 0,
      otHours: 0,
    };
  }

  let otHours = 0;
  if (workingDayStatus === "half") {
    workingHoursTreshold = 6;
  } else if (
    workingDayStatus === "off" ||
    holiday.categories.mercantile ||
    holiday.categories.public
  ) {
    workingHoursTreshold = 0;
  }
  if (workingHours > workingHoursTreshold) {
    otHours = workingHours - workingHoursTreshold;
  }
  let multiplier = 1.5;
  if (holiday.categories.mercantile) {
    multiplier = 2;
  }
  const ot = otHours > 0 ? (otHours * basic * multiplier) / divideBy : 0; // Example OT rate
  return {
    ot,
    otHours,
  };
};
