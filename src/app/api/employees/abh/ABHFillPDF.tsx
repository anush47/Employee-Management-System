import { PDFDocument } from "pdf-lib";
import { readFileSync } from "fs";
import { z } from "zod";

// Define schema for employee creation
export const employeeFormSchema = z.object({
  companyId: z.string().min(1, { message: "Company is required" }),
  name: z.string().min(1, "Employee name is required"),
  memberNo: z.number().min(1, "Member number is required"),
  nic: z
    .string()
    .regex(
      /^(?:[0-9]{9}[vVxX]|[0-9]{12})$/,
      "NIC must be a valid format (e.g., 123456789V or 123456789012)"
    ),
});

export const ABHFillPDF = async (details: any) => {
  const parsedDetails = employeeFormSchema.parse(details);

  const filePath = "/Form new with translations2024_A1.pdf";
  const pdfBytes = readFileSync(filePath);

  const pdfDoc = await PDFDocument.load(pdfBytes.toString("base64"));

  // Fill the PDF with parsedDetails
  // Example: pdf.text(parsedDetails.name, 10, 10);

  const pdfBytesFilled = await pdfDoc.save();

  return pdfBytesFilled;
};
