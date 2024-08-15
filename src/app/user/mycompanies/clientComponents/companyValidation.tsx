import { Company } from "./companiesDataGrid";

export const CompanyValidation = (
  formFields: Company
): { name?: string; employerNo?: string } => {
  const newErrors: { name?: string; employerNo?: string } = {};
  const employerNoPattern = /^[A-Z]\/\d{5}$/;

  //capitalize
  formFields.employerNo = formFields.employerNo.toUpperCase().trim();
  formFields.name = formFields.name.toUpperCase().trim();

  //make address propercase
  formFields.address = formFields.address
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .trim();

  if (!formFields.name.trim()) {
    newErrors.name = "Name cannot be empty";
  }

  if (!employerNoPattern.test(formFields.employerNo)) {
    newErrors.employerNo = "Employer Number must match the pattern A/12345";
  }

  return newErrors;
};
