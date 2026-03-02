export function formatCurrency(amount: number, currency = "IDR"): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: currency === "IDR" ? "IDR" : "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function generateInvoiceNumber(year: number, counter: number): string {
  return `INV/${year}/${String(counter).padStart(3, "0")}`;
}

export const INVOICE_STATUSES = [
  { value: "draft", label: "Draft", color: "slate" },
  { value: "sent", label: "Sent", color: "blue" },
  { value: "partial", label: "Partially Paid", color: "amber" },
  { value: "paid", label: "Paid", color: "emerald" },
  { value: "overdue", label: "Overdue", color: "rose" },
] as const;
