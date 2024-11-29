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
  active: boolean;
  monthlyPrice: number;
  employerName: string;
  employerAddress: string;
  requiredDocs: {
    epf: boolean;
    etf: boolean;
    salary: boolean;
    paySlip: boolean;
  };
  mode: "self" | "visit" | "aided";
  shifts: {
    start: string;
    end: string;
  }[];
  workingDays: {
    [key: string]: "full" | "half" | "off";
  };
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
    monthlyPrice: {
      type: Number,
      required: true,
      default: 3000,
    },
    startedAt: {
      type: String,
    },
    endedAt: {
      type: String,
    },
    active: {
      type: Boolean,
      required: true,
      default: true,
    },
    paymentMethod: {
      type: String,
    },
    workingDays: {
      type: {
        mon: {
          type: String,
          enum: ["full", "half", "off"],
          default: "full",
          required: true,
        },
        tue: {
          type: String,
          enum: ["full", "half", "off"],
          default: "full",
          required: true,
        },
        wed: {
          type: String,
          enum: ["full", "half", "off"],
          default: "full",
          required: true,
        },
        thu: {
          type: String,
          enum: ["full", "half", "off"],
          default: "full",
          required: true,
        },
        fri: {
          type: String,
          enum: ["full", "half", "off"],
          default: "full",
          required: true,
        },
        sat: {
          type: String,
          enum: ["full", "half", "off"],
          default: "half",
          required: true,
        },
        sun: {
          type: String,
          enum: ["full", "half", "off"],
          default: "off",
          required: true,
        },
      },
    },
    mode: {
      type: String,
      required: true,
      default: "self",
      enum: ["self", "visit", "aided"],
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
        default: [{ name: "EPF 8%", amount: null }],
      },
    },
    requiredDocs: {
      type: {
        epf: {
          type: Boolean,
          required: true,
          default: true,
        },
        etf: {
          type: Boolean,
          required: true,
          default: true,
        },
        salary: {
          type: Boolean,
          required: true,
          default: true,
        },
        paySlip: {
          type: Boolean,
          required: true,
          default: true,
        },
      },
    },
    employerName: {
      type: String,
    },
    employerAddress: {
      type: String,
    },
  },
  {
    timestamps: true, // Optionally add timestamps for createdAt and updatedAt
  }
);

// Check if the model already exists
const Company = models.Company || model<ICompany>("Company", companySchema);

export default Company;
