// Single source of truth for money display: Indian Rupee (INR).
export const formatINR = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

// Indian digit grouping without the currency symbol (marketing/preview figures).
export const formatIN = (value) =>
  new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2 }).format(Number(value || 0));
