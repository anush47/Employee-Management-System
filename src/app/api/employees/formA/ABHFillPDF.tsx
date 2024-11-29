import { PDFDocument } from "pdf-lib";
import { readFileSync } from "fs";
import { z } from "zod";
import path from "path";

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

export const FormAFillPDF = async (details: any) => {
  const parsedDetails = employeeFormSchema.parse(details);

  const filePath = path.resolve(process.cwd(), "public/formA.pdf");
  const pdfBytes = readFileSync(filePath);

  const pdfDoc = await PDFDocument.load(pdfBytes.toString("base64"));

  //fill abh
  const form = pdfDoc.getForm();
  //print all forms
  console.log(form.getFields());

  const pdfBytesFilled = await pdfDoc.save();

  return pdfBytesFilled;
};
