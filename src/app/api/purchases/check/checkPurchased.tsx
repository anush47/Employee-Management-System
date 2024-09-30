import Purchase from "@/app/models/Purchase";

export const checkPurchased = async (companyId: string, period: string) => {
  const purchases = await Purchase.find({
    company: companyId,
  });

  if (!purchases) {
    return "unavailable";
  }

  const periodFormatted = `${period.split("-")[1]}-${period.split("-")[0]}`;
  let found = false;

  for (const purchase of purchases) {
    if (purchase.periods) {
      for (const p of purchase.periods) {
        if (p === periodFormatted || p === period) {
          found = true;
          if (purchase.approvedStatus !== "declined")
            return purchase.approvedStatus;
        }
      }
    }
  }

  if (!found) return "unavailable";

  return "declined";
};
