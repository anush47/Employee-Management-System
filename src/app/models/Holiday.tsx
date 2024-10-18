import { Schema, model, models, Document } from "mongoose";

interface IHoliday extends Document {
  date: string;
  categories: {
    public: boolean;
    mercantile: boolean;
    bank: boolean;
  };
  summary: string;
}

const holidaySchema = new Schema<IHoliday>({
  date: {
    type: String,
    required: true,
    unique: true,
  },
  categories: {
    type: {
      public: {
        type: Boolean,
        required: true,
      },
      mercantile: {
        type: Boolean,
        required: true,
      },
      bank: {
        type: Boolean,
        required: true,
      },
    },
    required: true,
  },
  summary: {
    type: String,
  },
});

// Check if the model already exists
const Holiday = models.Holiday || model<IHoliday>("Holiday", holidaySchema);

export default Holiday;
