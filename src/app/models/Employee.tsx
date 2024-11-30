import { Schema, model, models, Document } from "mongoose";

// Define an interface for the Employee document
interface IEmployee extends Document {
  memberNo: number;
  name: string;
  nic: string;
  basic: number;
  totalSalary: string;
  company: Schema.Types.ObjectId;
  designation: string;
  startedAt: string;
  resignedAt: string;
  remark: string;
  phoneNumber: string;
  email: string;
  address: string; // Add this line
  workingDays: {
    [key: string]: "full" | "half" | "off";
  };
  divideBy: 240 | 200;
  active: boolean;
  otMethod: "random" | "noOt" | "calc";
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

// Define the schema for the Employee model
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
    totalSalary: {
      type: String,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    designation: {
      type: String,
    },
    remark: {
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
    },
    startedAt: {
      type: String,
    },
    resignedAt: {
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
    divideBy: {
      type: Number,
      enum: [240, 200],
      default: 240,
    },
    otMethod: {
      type: String,
      required: true,
      default: "random",
    },
    active: {
      type: Boolean,
      default: true,
    },
    phoneNumber: {
      type: String,
    },
    email: {
      type: String,
    },
    address: {
      type: String, // Add this block
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
        default: [{ name: "EPF 8%", amount: null }],
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
