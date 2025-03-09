import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CompanySchema } from "./helpers";

export const getSalaryDoc = (
  company: CompanySchema,
  period: string,
  columns: { dataKey: string; header: string }[],
  data: (string | number)[][]
) => {
  //remove inOut columns
  columns = columns.filter((column) => column.dataKey !== "inOut");

  const doc = new jsPDF({
    orientation: "landscape",
    format: "a4",
  });

  const borderMargin = 3;

  let x = 8;
  let y = 15;
  const smallFontColumns = ["memberNo", "budgetaryAllowance", "basicWithBA"];
  //add long names
  columns.forEach((column) => {
    if (column.header.length > 15) {
      smallFontColumns.push(column.dataKey);
    }
  });

  //left top part
  // Company name
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(18);
  doc.text(company.name, x, y);

  // Company address
  // split into 3 lines maximum
  const lines = company.address
    .replace(/\n/g, "")
    .split(",")
    .map((line) => line.trim());
  doc.setFont("Courier", "normal");
  doc.setFontSize(12);
  //address start
  const numberOfLines = 4;
  y += 7;
  lines
    .slice(0, numberOfLines - 1)
    .forEach((line: string | number, index: number) => {
      doc.text(line + (index < lines.length - 1 ? "," : ""), x, y);
      //address line spacing
      y += 5;
    });
  doc.text(lines.slice(numberOfLines - 1, lines.length).join(","), x, y);

  // number of employees text
  y += 8;
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(12);
  doc.text(`Number of Employees: ${data.length - 3}`, x, y);

  //right top part
  x = doc.internal.pageSize.width - 68;
  // Registration Number
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`Registration Number: ${company.employerNo}`, x, y);

  //horizontal line
  x = 8;
  y += 5;
  doc.setLineWidth(0.2);
  doc.line(x, y, doc.internal.pageSize.width - x, y);

  //period and title
  y += 7;
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  //period text
  let [year, month] = period.split("-");
  const monthName = new Date(`${month}-01-2020`)
    .toLocaleString("default", {
      month: "long",
    })
    .toUpperCase();
  const titleText = `SALARIES FOR THE MONTH OF ${monthName} - ${year}`;
  //center
  x = (doc.internal.pageSize.width - doc.getTextWidth(titleText)) / 2;
  doc.text(titleText, x, y);
  //horizontal line
  x = 8;
  y += 3;
  doc.setLineWidth(0.2);
  doc.line(x, y, doc.internal.pageSize.width - x, y);

  //table
  y += 5;
  // Table header
  doc.setFont("Helvetica", "bold");
  // Add content using autoTable
  autoTable(doc, {
    columns: columns,
    headStyles: {
      fillColor: [0, 0, 0],
      textColor: [255, 255, 255],
      lineColor: [255, 255, 255],
      valign: "middle",
      halign: "center",
    },
    body: data,
    startY: y,
    theme: "grid",
    styles: {
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
      fontSize: 7,
      overflow: "linebreak",
      halign: "center",
      valign: "middle",
    },
    margin: {
      left: 8,
      right: 8,
      top: 8,
      bottom: 8,
    },
    willDrawPage: function (data) {
      //page Border
      data.doc.setDrawColor(0);
      data.doc.setLineWidth(0.2);
      data.doc.rect(
        borderMargin,
        borderMargin,
        doc.internal.pageSize.width - 2 * borderMargin,
        doc.internal.pageSize.height - 2 * borderMargin
      );
    },
    didParseCell: function (data) {
      //memberNo
      if (data.column.dataKey === "memberNo") {
        data.cell.styles.cellWidth = 13;
        data.cell.styles.halign = "center";
      }
      //name
      else if (data.column.dataKey === "name") {
        const width = doc.getTextWidth(data.cell.text.join(" "));
        if (width <= 50) data.cell.styles.cellWidth = "wrap";
        else data.cell.styles.cellWidth = "auto";
      }
      //nic
      else if (data.column.dataKey === "nic") {
        data.cell.styles.cellWidth = 20;
      }

      if (data.section === "head") {
        if (smallFontColumns.includes(data.column.dataKey.toString())) {
          data.cell.styles.fontSize = 6;
        }
      }

      //format currency
      if (
        !(
          data.column.dataKey === "memberNo" ||
          data.column.dataKey === "name" ||
          data.column.dataKey === "nic" ||
          //last two rows except total
          (data.row.index >= data.table.body.length - 3 &&
            data.row.index < data.table.body.length - 1)
        )
      ) {
        if (!isNaN(Number(data.cell.text))) {
          data.cell.text = [
            Number(data.cell.text) !== 0
              ? Number(data.cell.text).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : "-",
          ];
          //allign right
          data.cell.styles.halign = "right";
        }
      }

      //totals row
      if (data.row.index === data.table.body.length - 1) {
        //data.cell.styles.fontStyle = "bold";
        //data.cell.styles.lineWidth = 0.4;
        //colspan
        if (data.column.dataKey === "memberNo") {
          data.cell.colSpan = 3;
        }
      }
    },
    didDrawPage: function (data) {
      //add page number
      doc.setFontSize(9);
      doc.setFont("Helvetica", "normal");
      doc.text(
        `Page ${data.pageNumber}`,
        doc.internal.pageSize.width - 20,
        doc.internal.pageSize.height - 5
      );
    },
  });

  return doc;
};
