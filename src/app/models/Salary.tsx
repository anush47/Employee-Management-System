import { Schema, model, models, Document } from "mongoose";

// Define an interface for the Salary document
interface ISalary extends Document {
  company: Schema.Types.ObjectId;
  memberNo: number;
  month: string;
  basic: number;
  noPay: {
    amount: number;
    reason: string;
  };
  ot: {
    amount: number;
    reason: string;
  };
  paymentStructure: {
    additions: {
      name: string;
      amount: number;
    }[];
    deductions: {
      name: string;
      amount: number;
    }[];
  };
  advanceAmount: number;
  finalSalary: number;
}

// Define the schema for the Salary model
const salarySchema = new Schema<ISalary>(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    memberNo: {
      type: Number,
      required: true,
    },
    month: {
      type: String,
      required: true,
    },
    basic: {
      type: Number,
      required: true,
    },
    noPay: {
      amount: {
        type: Number,
        required: true,
      },
      reason: {
        type: String,
      },
    },
    ot: {
      amount: {
        type: Number,
        required: true,
      },
      reason: {
        type: String,
      },
    },
    paymentStructure: {
      additions: [
        {
          name: {
            type: String,
            required: true,
          },
          amount: {
            type: Number,
            required: true,
          },
        },
      ],
      deductions: [
        {
          name: {
            type: String,
            required: true,
          },
          amount: {
            type: Number,
            required: true,
          },
        },
      ],
    },
    advanceAmount: {
      type: Number,
    },
    finalSalary: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true, // Optionally add timestamps for createdAt and updatedAt
  }
);

// Check if the model already exists
const Salary = models.Salary || model<ISalary>("Salary", salarySchema);

export default Salary;
