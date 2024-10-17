import dbConnect from "@/app/lib/db";
import Company from "@/app/models/Company";
import Employee from "@/app/models/Employee";
import Payment from "@/app/models/Payment";
import Salary from "@/app/models/Salary";
import { degrees, PDFDocument } from "pdf-lib";
import { getSalaryDoc } from "./salary";
import { getEPFDoc } from "./epf";
import { getETFDoc } from "./etf";
import { getPaySlipDoc } from "./payslip";

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
  advanceAmount: number;
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
      advanceAmount: salary.advanceAmount,
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
  columns.push({ dataKey: "advanceAmount", header: "ADVANCE AMOUNT" });
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

  for (const pdfBuffer of pdfsToMerges) {
    const pdf = await PDFDocument.load(pdfBuffer); // Load each PDF in the order of the array
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices()); // Copy pages from the original PDF
    copiedPages.forEach((page) => {
      mergedPdf.addPage(page); // Add each page to the merged PDF in sequence
    });
  }

  const mergedPdfFile = await mergedPdf.save(); // Save the merged PDF
  return mergedPdfFile; // Return the final merged PDF file
};

export const getPDFOutput = async (
  company: CompanySchema,
  period: string,
  columns: { dataKey: string; header: string }[],
  data: (string | number)[][],
  payment: PaymentSchema,
  pdfType: string,
  employees: {
    _id: string;
    memberNo: number;
    name: string;
    nic: string;
    designation: string;
  }[]
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
  } else if (pdfType === "payslip") {
    pdfOutput = await getCombinedPayslips(
      company,
      period,
      columns,
      data,
      employees
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
    const payslipDoc = await getCombinedPayslips(
      company,
      period,
      columns,
      data,
      employees
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
        payslipDoc.buffer as ArrayBuffer,
      ]);
    } else {
      //add copies
      pdfOutput = await mergePdfs([
        rotatedSalaryPdfBuffer.buffer as ArrayBuffer,
        epfDoc,
        epfDoc,
        etfDoc,
        etfDoc,
        payslipDoc.buffer as ArrayBuffer,
      ]);
    }
  }
  return pdfOutput;
};

const getCombinedPayslips = async (
  company: CompanySchema,
  period: string,
  columns: { dataKey: string; header: string }[],
  data: (string | number)[][],
  employees: {
    _id: string;
    memberNo: number;
    name: string;
    nic: string;
    designation: string;
  }[]
) => {
  const mergePdfsIntoQuads = async (pdfsToMerge: ArrayBuffer[]) => {
    const mergedPdf = await PDFDocument.create();
    let page = mergedPdf.addPage();
    const { width, height } = page.getSize();

    let pdfIndex = 0;

    for (let i = 0; i < pdfsToMerge.length; i += 4) {
      // For each set of 4 PDFs, create a new page if necessary
      if (i > 0) page = mergedPdf.addPage();

      // Loop over a set of 4 PDFs (or less, if remaining are fewer than 4)
      for (let j = 0; j < 4; j++) {
        pdfIndex = i + j;
        if (pdfIndex >= pdfsToMerge.length) break; // If no more PDFs left

        const pdfBuffer = pdfsToMerge[pdfIndex];
        const pdf = await PDFDocument.load(pdfBuffer);
        const [embeddedPage] = await mergedPdf.embedPages(pdf.getPages());

        // Calculate positions to place each PDF page in a 2x2 grid
        const xOffset = (j % 2) * (width / 2); // Two columns
        const yOffset = height - Math.floor(j / 2) * (height / 2) - height / 2; // Two rows

        // Draw the embedded page on the merged document
        page.drawPage(embeddedPage, {
          x: xOffset,
          y: yOffset,
          width: width / 2, // Scaling to fit 4 on a single page
          height: height / 2,
        });
      }
    }

    const mergedPdfFile = await mergedPdf.save();
    return mergedPdfFile;
  };

  const paySlipDocArrays: ArrayBuffer[] = [];

  // Iterate over each salary record to generate payslips, avoiding the last 3
  for (let i = 0; i < data.length - 3; i++) {
    const salary = data[i];
    // Find the employee by their memberNo (first column in salary data)
    let employee = employees.find((e) => e.memberNo === salary[0]);
    if (!employee) {
      employee = undefined;
    }

    // Get the payslip document (assuming getPaySlipDoc returns a jsPDF instance)
    const payslipDoc = getPaySlipDoc(
      company,
      period,
      columns,
      salary,
      employee
    );

    // Convert jsPDF document to arraybuffer
    const payslipArrayBuffer = payslipDoc.output("arraybuffer");
    paySlipDocArrays.push(payslipArrayBuffer);
  }

  // Combine the payslips into quads and await the result
  const combinedPayslips = await mergePdfsIntoQuads(paySlipDocArrays);
  return combinedPayslips;
};
