import { Schema, model, models, Document } from "mongoose";

// Define an interface for the Purchases document
interface IPurchase extends Document {
  periods: string[];
  company: Schema.Types.ObjectId;
  price: number;
  request: string | null;
  requestDay: string;
  approvedStatus: "approved" | "pending" | "rejected";
}

// Define the schema for the Purchases model
const purchaseSchema = new Schema<IPurchase>(
  {
    periods: {
      type: [String],
      required: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    request: {
      type: String,
    },
    requestDay: {
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
const Purchase =
  models.Purchase || model<IPurchase>("Purchase", purchaseSchema);

export default Purchase;
