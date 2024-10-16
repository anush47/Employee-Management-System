import dbConnect from "@/app/lib/db";
import Company from "@/app/models/Company";
import Employee from "@/app/models/Employee";
import Payment from "@/app/models/Payment";
import Salary from "@/app/models/Salary";
import { degrees, PDFDocument } from "pdf-lib";
import { getSalaryDoc } from "./salary";
import { getEPFDoc } from "./epf";
import { getETFDoc } from "./etf";

//salary schema type
export type SalarySchema = {
  _id: string;
  employee: {
    memberNo: number;
    name: string;
    nic: string;
  };
  period: string;
  basic: number;
  noPay: { amount: number };
  ot: { amount: number };
  paymentStructure: {
    additions: { name: string; amount: string | number }[];
    deductions: { name: string; amount: string | number }[];
  };
  finalSalary: number;
};

//company
export type CompanySchema = {
  name: string;
  employerNo: string;
  address: string;
};

//paymentSchema
export type PaymentSchema = {
  _id: string;
  company: string;
  period: string;
  epfReferenceNo: string;
  epfAmount: number;
  epfPaymentMethod: string;
  epfChequeNo: string;
  epfSurcharges: number;
  epfPayDay: string;
  etfAmount: number;
  etfPaymentMethod: string;
  etfSurcharges: number;
  etfChequeNo: string;
  etfPayDay: string;
};

export const getData = async (
  companyId: string,
  period: string,
  needPayment: boolean = false,
  salaryIds: string[] | undefined = undefined
) => {
  await dbConnect();

  // Fetch company details
  const company = await Company.findById(companyId).select(
    "name employerNo address"
  );

  // Fetch employees of the company
  const employees = await Employee.find({ company: companyId }).select(
    "memberNo name nic designation"
  );

  // Ensure employees are fetched correctly
  if (!employees || employees.length === 0) {
    throw new Error("No employees found for the given company.");
  }

  // Fetch salaries and populate employee details in one query
  const salaries = await Salary.find({
    employee: { $in: employees.map((employee) => employee._id) },
    ...(salaryIds ? { _id: { $in: salaryIds } } : {}),
    period,
  })
    .populate("employee", "memberNo name nic")
    .select("-inOut"); // Exclude the 'inOut' field

  let payment = undefined;
  if (needPayment) {
    // Fetch payments
    payment = await Payment.findOne({
      company: companyId,
      period,
    });
  }

  return { company, salaries, payment, employees };
};

export const setupData = (salaries: SalarySchema[]) => {
  // Initial static columns
  const columns = [
    {
      dataKey: "memberNo",
      header: "MEMBER NO.",
    },
    {
      dataKey: "name",
      header: "NAME",
    },
    {
      dataKey: "nic",
      header: "NIC",
    },
    {
      dataKey: "basic",
      header: "BASIC",
    },
    {
      dataKey: "budgetaryAllowance",
      header: "BUDGETARY ALLOWANCE (+)",
    },
    {
      dataKey: "basicWithBA",
      header: "BASIC (WITH B.A.)",
    },
    {
      dataKey: "noPay",
      header: "NO PAY (-)",
    },
    {
      dataKey: "salaryForEPF",
      header: "SALARY FOR EPF",
    },
    {
      dataKey: "epf12",
      header: "EPF (EMPLOYER 12%)",
    },
    {
      dataKey: "epf8",
      header: "EPF (EMPLOYEE 8%) (-)",
    },
    {
      dataKey: "etf3",
      header: "ETF (EMPLOYER 3%)",
    },
  ];

  const records: { [key: string]: string | number }[] = [];
  const additions = new Set<string>();
  const deductions = new Set<string>();

  // Iterate over salaries and build records
  salaries.forEach((salary) => {
    const modifiedSalary: { [key: string]: any } = {
      memberNo: salary.employee.memberNo,
      name: salary.employee.name,
      nic: salary.employee.nic,
      basic: salary.basic - 3500,
      budgetaryAllowance: 3500, // Example static value
      basicWithBA: salary.basic, // Adjust to actual logic
      noPay: salary.noPay.amount || 0,
      salaryForEPF: salary.basic || 0,
      epf12: salary.basic * 0.12,
      etf3: salary.basic * 0.03,
      epf8: salary.basic * 0.08,
      finalSalary: salary.finalSalary,
    };

    // Add dynamic additions
    salary.paymentStructure.additions.forEach(
      (addition: { name: string; amount: string | number }) => {
        const nameText = `${addition.name.toUpperCase()} (+)`;
        additions.add(nameText); // Collect dynamic addition columns
        modifiedSalary[nameText] = addition.amount || 0;
      }
    );

    // Add dynamic deductions
    salary.paymentStructure.deductions.forEach(
      (deduction: { name: string; amount: string | number }) => {
        const nameText = `${deduction.name.toUpperCase()} (-)`;
        deductions.add(nameText); // Collect dynamic deduction columns
        modifiedSalary[nameText] = deduction.amount || 0;
      }
    );

    if (salary.ot && salary.ot.amount !== 0) {
      modifiedSalary["OT (+)"] = salary.ot.amount;
      additions.add("OT (+)");
    }

    // Push the modified record into the records array
    records.push(modifiedSalary);
  });

  // Add dynamic addition and deduction columns
  additions.forEach((addition) => {
    columns.push({ dataKey: addition, header: addition });
  });
  deductions.forEach((deduction) => {
    columns.push({ dataKey: deduction, header: deduction });
  });

  // Finalize columns by adding static columns like "FINAL SALARY"
  columns.push({ dataKey: "finalSalary", header: "FINAL SALARY" });

  // Prepare data based on columns
  const data: (string | number)[][] = records.map((record) => {
    return columns.map((column) => record[column.dataKey] || ""); // Default to "-" if data is missing
  });

  //add 2 blank rows
  data.push(Array(columns.length).fill(""));
  data.push(Array(columns.length).fill(""));

  //totals
  const totals = columns.map((column) => {
    if (column.dataKey === "memberNo") {
      return "TOTAL";
    } else if (column.dataKey === "name" || column.dataKey === "nic") {
      return "";
    } else {
      let total = 0;
      for (let i = 0; i < records.length; i++) {
        total += Number(records[i][column.dataKey]) || 0;
      }
      return total;
    }
  });
  data.push(totals);

  return {
    columns,
    data,
  };
};

export const mergePdfs = async (pdfsToMerges: ArrayBuffer[]) => {
  const mergedPdf = await PDFDocument.create();
  const actions = pdfsToMerges.map(async (pdfBuffer) => {
    const pdf = await PDFDocument.load(pdfBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => {
      // console.log('page', page.getWidth(), page.getHeight());
      // page.setWidth(210);
      mergedPdf.addPage(page);
    });
  });
  await Promise.all(actions);
  const mergedPdfFile = await mergedPdf.save();
  return mergedPdfFile;
};

export const getPDFOutput = async (
  company: CompanySchema,
  period: string,
  columns: { dataKey: string; header: string }[],
  data: (string | number)[][],
  payment: PaymentSchema,
  pdfType: string
) => {
  let pdfOutput;
  if (pdfType === "salary") {
    pdfOutput = getSalaryDoc(company, period, columns, data).output(
      "arraybuffer"
    );
  } else if (pdfType === "epf") {
    pdfOutput = getEPFDoc(company, period, columns, data, payment).output(
      "arraybuffer"
    );
  } else if (pdfType === "etf") {
    pdfOutput = getETFDoc(company, period, columns, data, payment).output(
      "arraybuffer"
    );
  } else if (pdfType === "all" || pdfType === "print") {
    const salaryDoc = getSalaryDoc(company, period, columns, data).output(
      "arraybuffer"
    );
    const epfDoc = getEPFDoc(company, period, columns, data, payment).output(
      "arraybuffer"
    );
    const etfDoc = getETFDoc(company, period, columns, data, payment).output(
      "arraybuffer"
    );

    // Rotate salary document pages by 90 degrees
    const salaryPdfDoc = await PDFDocument.load(salaryDoc);
    const rotatedSalaryPdfPages = salaryPdfDoc.getPages();
    rotatedSalaryPdfPages.forEach((page) => page.setRotation(degrees(90)));
    const rotatedSalaryPdfBuffer = await salaryPdfDoc.save();
    // Combine all the documents into one
    if (pdfType === "all") {
      pdfOutput = await mergePdfs([
        rotatedSalaryPdfBuffer.buffer as ArrayBuffer,
        epfDoc,
        etfDoc,
      ]);
    } else {
      //add copies
      pdfOutput = await mergePdfs([
        rotatedSalaryPdfBuffer.buffer as ArrayBuffer,
        epfDoc,
        epfDoc,
        etfDoc,
        etfDoc,
      ]);
    }
  }
  return pdfOutput;
};
