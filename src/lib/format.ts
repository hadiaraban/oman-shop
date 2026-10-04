export function formatOMR(amount: number | string | { toString(): string }): string {
  const str = typeof amount === "object" ? amount.toString() : String(amount);
  const num = parseFloat(str);
  if (isNaN(num)) return "0.000 OMR";
  return `${num.toFixed(3)} OMR`;
}