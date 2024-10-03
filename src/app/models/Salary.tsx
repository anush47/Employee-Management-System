import { Schema, model, models, Document } from "mongoose";

// Define an interface for the Salary document
interface ISalary extends Document {
  employee: Schema.Types.ObjectId;
  period: string;
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
  inOut: {
    in: Date;
    out: Date;
    workingHours: number;
    otHours: number;
    ot: number;
    noPay: number;
    holiday: string;
    description: string;
  }[];
  advanceAmount: number;
  finalSalary: number;
}

// Define the schema for the Salary model
const salarySchema = new Schema<ISalary>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    period: {
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
    inOut: [
      {
        in: {
          type: Date,
        },
        out: {
          type: Date,
        },
        workingHours: {
          type: Number,
        },
        otHours: {
          type: Number,
        },
        ot: {
          type: Number,
        },
        noPay: {
          type: Number,
        },
        holiday: {
          type: String,
        },
        description: {
          type: String,
        },
      },
    ],
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
