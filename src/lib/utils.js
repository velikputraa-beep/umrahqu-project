export { cn } from "cn"

const BULAN = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

export function formatTanggal(date) {
  return `${String(date.getDate()).padStart(2, "0")} ${BULAN[date.getMonth()]} ${date.getFullYear()}`;
}
