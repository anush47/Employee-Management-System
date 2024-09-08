import { Schema, model, models, Document } from "mongoose";

// Define an interface for the Purchases document
interface IPurchase extends Document {
  period: string;
  company: string;
  price: number;
  request: string;
  approvedStatus: "approved" | "pending" | "rejected";
}

// Define the schema for the Purchases model
const purchasesSchema = new Schema<IPurchase>(
  {
    period: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    request: {
      type: String,
      required: true,
    },
    approvedStatus: {
      type: String,
      default: "pending",
      enum: ["approved", "pending", "rejected"],
      required: true,
    },
  },
  {
    timestamps: true, // Optionally add timestamps for createdAt and updatedAt
  }
);

// Check if the model already exists
const Purchases =
  models.Purchases || model<IPurchase>("Purchases", purchasesSchema);

export default Purchases;
