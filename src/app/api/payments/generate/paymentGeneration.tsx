import dayjs from "dayjs";

type Company = {
  paymentMethod: string;
};

type Salary = {
  basic: number;
};

type Payment = {
  epfAmount: number;
  etfAmount: number;
};

export function generatePayment(company: Company, salaries: Salary[]): Payment {
  try {
    let sumTotalEarnings = 0;
    for (let salary of salaries) {
      sumTotalEarnings += calculateTotalEarnings(salary);
    }

    const payment: Payment = {
      epfAmount: sumTotalEarnings * 0.2,
      etfAmount: sumTotalEarnings * 0.03,
    };

    return payment;
  } catch (error) {
    console.error("Error generating payments:", error);
    throw new Error(
      error instanceof Error ? error.message : "An unexpected error occurred"
    );
  }
}

//total earnings calculate
export function calculateTotalEarnings(salary: Salary) {
  let totalEarnings = 0;
  try {
    totalEarnings += salary.basic;
  } catch {
    console.log("Error in salary", salary);
  }
  return totalEarnings;
}
