import { PDFDocument } from "pdf-lib";
import { readFileSync } from "fs";
import { z } from "zod";
import path from "path";
import { aFormMap } from "./aFormFieldMap";

// Define schema for employee creation
export const employeeFormSchema = z.object({
  companyId: z.string().min(1, { message: "Company is required" }),
  name: z.string().min(1, "Employee name is required"),
  employerNo: z.string().regex(/[A-Z]\/\d{5}/),
  memberNo: z.number().min(0),
  nic: z
    .string()
    .regex(
      /^(?:[0-9]{9}[vVxX]|[0-9]{12})$/,
      "NIC must be a valid format (e.g., 123456789V or 123456789012)"
    ),
});

const splitIntoLetters = (text: string) => {
  //split into individual letters
  const letters = text.split("");
  return letters;
};

export const FormAFillPDF = async (details: any) => {
  const parsedDetails = employeeFormSchema.parse(details);

  const filePath = path.resolve(process.cwd(), "public/formA.pdf");
  const pdfBytes = readFileSync(filePath);

  const pdfDoc = await PDFDocument.load(pdfBytes.toString("base64"));

  //fill abh
  const form = pdfDoc.getForm();

  const fillField = (
    fieldMap: string[],
    text: string,
    split: boolean = true
  ) => {
    if (split) {
      const letters = splitIntoLetters(text);
      for (let index = 0; index < fieldMap.length; index++) {
        if (index >= letters.length) {
          break;
        }
        const element = fieldMap[index];
        const letter = letters[index];
        form.getTextField(element).setText(letter);
      }
    } else {
      form.getTextField(fieldMap[0]).setText(text);
    }
  };

  //1. National Identity Card No
  fillField(aFormMap.nic, parsedDetails.nic);

  //2. Employer’s No
  //split employerNo to zone and number
  const employerNo = parsedDetails.employerNo.split("/");
  fillField(aFormMap.employerNoNumber, employerNo[1]);
  fillField(aFormMap.employerZone, employerNo[0]);

  //3. Member’s No
  fillField(aFormMap.memberNo, parsedDetails.memberNo.toString());
  const pdfBytesFilled = await pdfDoc.save();

  return pdfBytesFilled;
};
