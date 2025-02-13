"use client";

import { cn } from "@/lib/utils";

export function BinaryDisplay({
  value,
  bits = 8,
  className,
}: {
  value: number;
  bits?: number;
  className?: string;
}) {
  const binary = value.toString(2).padStart(bits, "0");

  return (
    <span
      className={cn(
        "font-mono font-bold text-center p-1 rounded bg-neutral-900",
        className
      )}
    >
      {Array.from(binary).map((bit, i) => (
        <span
          key={i}
          className={cn(
            "transition-colors",
            bit === "1" ? "text-blue-300" : "text-neutral-400"
          )}
        >
          {bit}
        </span>
      ))}
    </span>
  );
} 