import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPKR(amount: number): string {
  const rounded = Math.round((Number(amount) || 0) * 100) / 100;
  return `PKR ${rounded.toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function formatNumber(num: number): string {
  return (Number(num) || 0).toLocaleString();
}

export function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}
