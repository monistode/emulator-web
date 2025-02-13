"use client";

export function AsciiDisplay({
  value,
}: {
  value: number;
}) {
  // Show printable ASCII characters (including space) and special characters
  if (value === 10) return "⏎";
  if (value === 32) return "␣";
  if (value === 9) return "⇥";
  return value >= 32 && value <= 126 ? String.fromCharCode(value) : ".";
} 