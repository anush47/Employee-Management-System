import { employeeFormSchema } from "./route";
import { PDFDocument } from "pdf-lib";
import { readFileSync } from "fs";

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
