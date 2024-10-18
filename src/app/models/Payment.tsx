import { Schema, model, models, Document } from "mongoose";

// Define an interface for the Salary document
interface IPayment extends Document {
  company: Schema.Types.ObjectId;
  period: string;
  epfReferenceNo: string;
  epfAmount: number;
  epfSurcharges: number;
  epfPaymentMethod: string;
  epfChequeNo: string;
  epfPayDay: string;
  etfAmount: number;
  etfSurcharges: number;
  etfPaymentMethod: string;
  etfChequeNo: string;
  etfPayDay: string;
  remark: string;
}

// Define the schema for the Salary model
const paymentSchema = new Schema<IPayment>(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    period: {
      type: String,
      required: true,
    },
    epfReferenceNo: {
      type: String,
    },
    epfAmount: {
      type: Number,
      required: true,
    },
    epfSurcharges: {
      type: Number,
    },
    epfPaymentMethod: {
      type: String,
    },
    epfChequeNo: {
      type: String,
    },
    epfPayDay: {
      type: String,
    },
    etfAmount: {
      type: Number,
      required: true,
    },
    etfSurcharges: {
      type: Number,
    },
    etfPaymentMethod: {
      type: String,
    },
    etfChequeNo: {
      type: String,
    },
    etfPayDay: {
      type: String,
    },
    remark: {
      type: String,
    },
  },
  {
    timestamps: true, // Optionally add timestamps for createdAt and updatedAt
  }
);

// Check if the model already exists
const Payment = models.Payment || model<IPayment>("Payment", paymentSchema);

export default Payment;
