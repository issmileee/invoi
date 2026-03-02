type InvoiceAmountItem = {
  quantity: number;
  price: number;
};

type InvoiceAmountInput = {
  items: InvoiceAmountItem[];
  discountType?: "percent" | "fixed" | string | null;
  discountValue?: number | null;
  ppnEnabled?: boolean | null;
  pphEnabled?: boolean | null;
  ppnRate?: number | null;
  pphRate?: number | null;
};

const DEFAULT_PPN_RATE = 11;
const DEFAULT_PPH_RATE = 2;

const toNumber = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

export function calculateInvoiceTotals(input: InvoiceAmountInput) {
  const subtotal = input.items.reduce((sum, item) => sum + toNumber(item.quantity) * toNumber(item.price), 0);
  const discountValue = toNumber(input.discountValue);
  const discount = input.discountType === "percent" ? (subtotal * discountValue) / 100 : discountValue;
  const afterDiscount = subtotal - discount;
  const ppnRate = toNumber(input.ppnRate) || DEFAULT_PPN_RATE;
  const pphRate = toNumber(input.pphRate) || DEFAULT_PPH_RATE;
  const ppn = input.ppnEnabled ? (afterDiscount * ppnRate) / 100 : 0;
  const pph = input.pphEnabled ? (afterDiscount * pphRate) / 100 : 0;
  const total = afterDiscount + ppn - pph;

  return {
    subtotal,
    discount,
    afterDiscount,
    ppn,
    pph,
    total,
  };
}

