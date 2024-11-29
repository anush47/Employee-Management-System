import { PDFDocument, PDFForm } from "pdf-lib";
import { readFileSync } from "fs";
import { z } from "zod";
import path from "path";
import { aFormMap } from "./aFormFieldMap";
import Email from "next-auth/providers/email";

// Define schema for employee creation
export const employeeFormSchema = z.object({
  companyId: z.string().min(1, { message: "Company is required" }),
  fullName: z.string().optional(),
  nameWithInitials: z.string().optional(),
  employerNo: z
    .string()
    .regex(/^[A-Z]\/\d{5}/, { message: "Invalid Employer No Format" })
    .optional(),
  memberNo: z
    .number()
    .min(0, { message: "Member No must be a positive number" })
    .optional(),
  startDate: z
    .string()
    .regex(/^\d{2}-\d{2}-\d{4}$/, { message: "Invalid Start Date Format" })
    .optional(),
  nic: z
    .string()
    .regex(/^(?:[0-9]{9}[vVxX]|[0-9]{12})$/, {
      message: "NIC must be a valid format (e.g., 123456789V or 123456789012)",
    })
    .optional(),
  designation: z.string().optional(),
  birthPlace: z.string().optional(),
  address: z.string().optional(),
  nationality: z.string().optional(),
  married: z.boolean().optional(),
  spouseName: z.string().optional(),
  motherName: z.string().optional(),
  fatherName: z.string().optional(),
  mobileNumber: z
    .string()
    .regex(/^\d{10}$/, "Invalid Mobile Number Format (e.g., 0712345678)")
    .optional(),
  email: z
    .string()
    .email("Invalid Email Format (e.g., example@example.com)")
    .optional(),
});

const getNICDetails = (nic: string) => {
  let year, days, birthDay, age, gender;

  if (nic.length === 10) {
    // Old NIC format
    year = parseInt("19" + nic.substring(0, 2));
    days = parseInt(nic.substring(2, 5));
  } else if (nic.length === 12) {
    // New NIC format
    year = parseInt(nic.substring(0, 4));
    days = parseInt(nic.substring(4, 7));
  } else {
    return { birthDay: "", age: "", gender: "" };
  }

  // Determine gender
  if (days > 500) {
    gender = "female";
    days -= 500;
  } else {
    gender = "male";
  }

  // Determine date of birth
  const dobDate = new Date(`${year}-01-01`); // January 1st of the given year
  //check if year is leap
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  if (days > 59 && !isLeapYear) {
    days -= 1;
  }
  dobDate.setDate(dobDate.getDate() + days - 1);

  //format as dd/mm/yyyy
  birthDay = `${dobDate.getDate().toString().padStart(2, "0")}-${(
    dobDate.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}-${dobDate.getFullYear()}`; // Format DD/MM/YYYY

  // Calculate age
  const today = new Date();
  age = today.getFullYear() - year;
  if (
    today.getMonth() < dobDate.getMonth() ||
    (today.getMonth() === dobDate.getMonth() &&
      today.getDate() < dobDate.getDate())
  ) {
    age--;
  }

  age = age.toString();

  return { birthDay, age, gender };
};

const splitIntoLetters = (text: string) => {
  //split into individual letters
  const letters = text.split("");
  return letters;
};

const fillTextField = (
  form: PDFForm,
  fieldMap: string[],
  text?: string,
  upperCase = true
) => {
  if (!text) return;
  //convert to uppercase
  const textUpper = upperCase ? text.toUpperCase() : text;
  const split = fieldMap.length > 1;
  if (split) {
    const letters = splitIntoLetters(textUpper);
    for (let index = 0; index < fieldMap.length; index++) {
      if (index >= letters.length) {
        break;
      }
      const element = fieldMap[index];
      const letter = letters[index];
      const textField = form.getTextField(element);
      if (textField) {
        textField.setText(letter);
      }
    }
  } else {
    const textField = form.getTextField(fieldMap[0]);
    if (textField) {
      textField.setText(textUpper);
    }
  }
};

const fillRadioGroup = (
  form: PDFForm,
  fieldMap: { group: string; options: { [key: string]: string } },
  option?: string
) => {
  if (!option) return;
  //find the radio button that matches the option
  const radioGroup = form.getRadioGroup(fieldMap.group);
  radioGroup.select(fieldMap.options[option]);
};

export const FormAFillPDF = async (details: any) => {
  const parsedDetails = employeeFormSchema.parse(details);

  const filePath = path.resolve(process.cwd(), "public/formA.pdf");
  const pdfBytes = readFileSync(filePath);

  const pdfDoc = await PDFDocument.load(pdfBytes.toString("base64"));

  //fill abh
  const form = pdfDoc.getForm();

  //1. National Identity Card No
  fillTextField(form, aFormMap.nic, parsedDetails.nic);
  const { birthDay, age, gender } = getNICDetails(parsedDetails.nic || "");

  //2. Employer’s No
  if (parsedDetails.employerNo) {
    const employerNo = parsedDetails.employerNo.split("/");
    fillTextField(form, aFormMap.employerNo.number, employerNo[1]);
    fillTextField(form, aFormMap.employerNo.zone, employerNo[0]);
  }

  //3. Member’s No
  fillTextField(form, aFormMap.memberNo, parsedDetails.memberNo?.toString());

  //4. Date Employed From
  //split into day month and year
  if (parsedDetails.startDate) {
    const [day_startDate, month_startDate, year_startDate] =
      parsedDetails.startDate.split("-");
    fillTextField(form, aFormMap.startDate.day, day_startDate);
    fillTextField(form, aFormMap.startDate.month, month_startDate);
    fillTextField(form, aFormMap.startDate.year, year_startDate);
  }

  //5. Nature of Work/ Designation
  fillTextField(form, aFormMap.designation, parsedDetails.designation);

  //6. Full Name
  fillTextField(form, aFormMap.fullName, parsedDetails.fullName);

  //7. Name with Initials
  fillTextField(
    form,
    aFormMap.nameWithInitials,
    parsedDetails.nameWithInitials
  );

  //8. Permanent Address
  fillTextField(form, aFormMap.address, parsedDetails.address);

  //9. Date of Birth
  if (birthDay) {
    const [day_birthDay, month_birthDay, year_birthDay] = birthDay.split("-");
    fillTextField(form, aFormMap.birthday.day, day_birthDay);
    fillTextField(form, aFormMap.birthday.month, month_birthDay);
    fillTextField(form, aFormMap.birthday.year, year_birthDay);
  }

  //10. Age
  fillTextField(form, aFormMap.age, age);

  //11. Birth Place
  fillTextField(form, aFormMap.birthPlace, parsedDetails.birthPlace);

  //12. Nationality
  fillTextField(form, aFormMap.nationality, parsedDetails.nationality);

  //13. Sex
  fillRadioGroup(form, aFormMap.sex, gender);

  //14. Married or Single
  fillRadioGroup(
    form,
    aFormMap.married,
    parsedDetails.married ? "married" : "single"
  );

  //15. Name of the Spouse
  if (parsedDetails.married && parsedDetails.spouseName) {
    fillTextField(form, aFormMap.spouseName, parsedDetails.spouseName);
  }

  //16. Name of the Mother
  fillTextField(form, aFormMap.motherName, parsedDetails.motherName);

  //17. Name of the Father
  fillTextField(form, aFormMap.fatherName, parsedDetails.fatherName);

  //18. Mobile Number
  fillTextField(form, aFormMap.mobileNumber, parsedDetails.mobileNumber);

  //19. E-mail
  fillTextField(form, aFormMap.email, parsedDetails.email, false);

  const pdfBytesFilled = await pdfDoc.save();
  //return null;
  return pdfBytesFilled;
};
