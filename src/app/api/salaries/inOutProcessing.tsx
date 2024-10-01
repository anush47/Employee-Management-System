export const inOutProcess = (employee: any, period: any, inOut: any) => {
  let inOutProcessed = "";
  let ot = 0;
  let noPay = 1000;
  let otReason = "no OT";
  let noPayReason = "Unapproved leaves";
  return { inOutProcessed, ot, otReason, noPay, noPayReason };
};

export const inOutGen = (employee: any, period: any, inOut: any) => {
  let inOutProcessed = "";
  let ot = 0;
  let noPay = 1000;
  let otReason = "no OT";
  let noPayReason = "Unapproved leaves";
  return { inOutProcessed, ot, otReason, noPay, noPayReason };
};
