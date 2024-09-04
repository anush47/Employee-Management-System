import { Schema, model, models, Document } from "mongoose";

// Define an interface for the Company document
interface ICompany extends Document {
  name: string;
  employerNo: string;
  address: string;
  user: Schema.Types.ObjectId;
  startedAt: String;
  endedAt: String;
  paymentMethod: String;
  shifts: {
    start: string;
    end: string;
  }[];
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
const companySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: true,
    },
    employerNo: {
      type: String,
      unique: true,
      required: true,
    },
    address: {
      type: String,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startedAt: {
      type: String,
    },
    endedAt: {
      type: String,
    },
    paymentMethod: {
      type: String,
    },
    shifts: {
      type: [
        {
          start: {
            type: String,
            required: true,
          },
          end: {
            type: String,
            required: true,
          },
        },
      ],
      required: true,
      default: [{ start: "08:00", end: "17:00" }],
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
        default: [
          { name: "Incentive", amount: null },
          { name: "Performance Allowance", amount: null },
        ],
      },
      deductions: {
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
        default: [],
      },
    },
  },
  {
    timestamps: true, // Optionally add timestamps for createdAt and updatedAt
  }
);

// Check if the model already exists
const Company = models.Company || model<ICompany>("Company", companySchema);

export default Company;
