"use client";
import { Button } from "@mui/material";
import React from "react";
import { z } from "zod";

// Define the payment schema using zod
const paymentSchema = z.object({
  company: z.string(),
  period: z.string(),
  companyName: z.string().optional(),
  companyEmployerNo: z.string().optional(),
  companyPaymentMethod: z.string().optional(),
  epfReferenceNo: z.string().optional(),
  epfAmount: z.number(),
  epfPaymentMethod: z.string().optional(),
  epfChequeNo: z.string().optional(),
  epfPayDay: z.string().optional(),
  etfAmount: z.number(),
  etfPaymentMethod: z.string().optional(),
  etfChequeNo: z.string().optional(),
  etfPayDay: z.string().optional(),
});

const Page: React.FC = () => {
  const handleSubmit = async () => {
    // Hardcoded form data based on schema
    const hardcodedData = {
      company: "66ee41e4e60b47d71aa46932", // Provided company value
      period: "2024-09", // Provided period value
      companyName: "Test Company Name", // Optional field
      companyEmployerNo: "123456", // Optional field
      companyPaymentMethod: "Bank Transfer", // Optional field
      epfReferenceNo: "EPF12345", // Optional field
      epfAmount: 5000, // Required
      epfPaymentMethod: "Cheque", // Optional field
      epfChequeNo: "CHQ123456", // Optional field
      epfPayDay: "2024-09-15", // Optional field
      etfAmount: 3000, // Required
      etfPaymentMethod: "Cheque", // Optional field
      etfChequeNo: "CHQ654321", // Optional field
      etfPayDay: "2024-09-16", // Optional field
    };

    try {
      // Validate data using the payment schema
      paymentSchema.parse(hardcodedData);

      // Test API call
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payment: hardcodedData,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("API response:", result);
      } else {
        console.error("API error:", response.statusText);
      }
    } catch (error) {
      console.error("Validation or API error:", error);
    }
  };

  const readPayment = async () => {
    try {
      // Test API call
      const link1 =
        "/api/payments/?companyId=66ee41e4e60b47d71aa46932&period=2024-09";
      const link2 = "/api/payments/?companyId=66ee4100e60b47d71aa4680a";
      const link3 = "/api/payments/?paymentId=6708dc60bc425740a7955f53";

      const response = await fetch(link2, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log("API response:", result);
      } else {
        console.error("API error:", response.statusText);
      }
    } catch (error) {
      console.error("API error:", error);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center
      h-screen"
    >
      <Button variant="contained" onClick={handleSubmit}>
        Submit
      </Button>
      <Button variant="contained" onClick={readPayment}>
        Read
      </Button>
    </div>
  );
};

export default Page;
