import { Schema, model, models, Document } from "mongoose";
import { string } from "zod";

// Define an interface for the Company document
interface IEmployee extends Document {
  memberNo: number;
  name: string;
  nic: string;
  basic: number;
  company: Schema.Types.ObjectId;
  designation: string;
  startedAt: string;
  resignedAt: string;
  divideBy: 240 | 200;
  paymentStructure: {
    additions: {
      name: string;
      amount: string;
    }[];
    deductions: {
      name: string;
      amount: string;
    }[];
  };
}

// Define the schema for the Company model
const employeeSchema = new Schema<IEmployee>(
  {
    memberNo: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    nic: {
      type: String,
      required: true,
    },
    basic: {
      type: Number,
      required: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    designation: {
      type: String,
    },
    startedAt: {
      type: String,
    },
    resignedAt: {
      type: String,
    },
    divideBy: {
      type: Number,
      enum: [240, 200],
      default: 240,
    },
    paymentStructure: {
      additions: {
        type: [
          {
            name: {
              type: String,
              required: true,
            },
            amount: {
              type: String,
            },
          },
        ],
      },
      deductions: {
        type: [
          {
            name: {
              type: String,
            },
            amount: {
              type: String,
            },
          },
        ],
      },
    },
  },
  {
    timestamps: true, // Optionally add timestamps for createdAt and updatedAt
  }
);

// Check if the model already exists
const Employee =
  models.Employee || model<IEmployee>("Employee", employeeSchema);

export default Employee;
