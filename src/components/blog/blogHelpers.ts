/** Design shows dates like "18 JUN 2026". */
export function formatBlogDate(date: Date): string {
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" }).toUpperCase();
  return `${day} ${month} ${date.getUTCFullYear()}`;
}
