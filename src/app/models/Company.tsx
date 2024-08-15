import { Schema, model, models, Document } from "mongoose";

// Define an interface for the Company document
interface ICompany extends Document {
  name: string;
  employerNo: string;
  address: string;
  user: Schema.Types.ObjectId;
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
  },
  {
    timestamps: true, // Optionally add timestamps for createdAt and updatedAt
  }
);

// Check if the model already exists
const Company = models.Company || model<ICompany>("Company", companySchema);

export default Company;
