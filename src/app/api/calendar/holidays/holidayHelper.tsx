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
  (startDate: string | null, endDate: string | null): Promise<{
    holidays: any[];
    messege: string;
  }>;
} = async (startDate: string | null, endDate: string | null) => {
  let query: any = {};

  if (startDate) {
    query.date = { ...query.date, $gte: startDate };
  }
  if (endDate) {
    query.date = { ...query.date, $lte: endDate };
  }

  // If neither startDate nor endDate is provided, return all holidays
  const holidays = await Holiday.find(query).lean();

  return {
    holidays,
    messege: "Holidays fetched successfully",
  };
};
