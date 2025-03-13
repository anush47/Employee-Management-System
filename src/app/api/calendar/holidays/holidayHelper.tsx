import Holiday from "@/app/models/Holiday";
import { z } from "zod";

// holidaySchema

const holidaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Date must be in the format yyyy-mm-dd",
  }),
  categories: z.object({
    public: z.boolean(),
    mercantile: z.boolean(),
    bank: z.boolean(),
  }),
  summary: z.string().optional(),
});

export const getHolidays: {
  (startDate: string, endDate: string): Promise<{
    holidays: any[];
    messege: string;
  }>;
} = async (startDate: string, endDate: string) => {
  //check if atleast one is available for the years of start day and end days if the years are different
  const startYear = startDate.split("-")[0];
  const endYear = endDate.split("-")[0];
  //check if atleast one is in start year
  Holiday.exists({
    date: { $gte: `${startYear}-01-01`, $lte: `${startYear}-12-31` },
  }).then((exists) => {
    if (!exists) {
      //send error
      return {
        holidays: undefined,
        message: `No holidays available for ${startYear}`,
      };
    }
  });
  if (startYear !== endYear) {
    //check if atleast one is in end year
    Holiday.exists({
      date: { $gte: `${endYear}-01-01`, $lte: `${endYear}-12-31` },
    }).then((exists) => {
      if (!exists) {
        //send error
        return {
          holidays: undefined,
          message: `No holidays available for ${endYear}`,
        };
      }
    });
  }

  // Get holidays
  const holidays = await Holiday.find({
    date: { $gte: startDate, $lte: endDate },
  }).lean();

  return { holidays, messege: "Holidays fetched successfully" };
};
