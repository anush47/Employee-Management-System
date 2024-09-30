//define function for calculation
export function calculateTotalPrice(pricePerMonth: number, months: string[]) {
  const noOfMonths = months.length;
  const totalPrice = pricePerMonth * noOfMonths;
  const finalTotalPrice = noOfMonths >= 3 ? totalPrice * 0.9 : totalPrice;
  return { totalPrice, finalTotalPrice };
}
