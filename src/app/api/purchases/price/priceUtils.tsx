export function calculateMonthlyPrice(
  company: any,
  employeeCount: number,
  activeEmployeeCount: number
): number {
  if (company === null) {
    return 2000;
  }
  if (company.monthlyPriceOverride) {
    return company.monthlyPrice;
  }
  const basePrice = 3000; // Base price for up to 5 employees
  const additionalPricePerFiveEmployees = 500; // Additional price for each set of 5 employees

  const employeeGroups = Math.ceil(activeEmployeeCount / 5);
  const totalPrice =
    basePrice + (employeeGroups - 1) * additionalPricePerFiveEmployees;

  return totalPrice;
}

export function calculateTotalPrice(company: any, months: string[]) {
  const pricePerMonth = company.monthlyPrice;
  const noOfMonths = months.length;
  const totalPrice = pricePerMonth * noOfMonths;
  const finalTotalPrice = noOfMonths >= 3 ? totalPrice * 0.9 : totalPrice;
  return { totalPrice, finalTotalPrice };
}
