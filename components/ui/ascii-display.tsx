"use client";

export function AsciiDisplay({
  value,
  addBreak = false,
}: {
  value: number;
  addBreak?: boolean;
}) {
  // Show printable ASCII characters (including space) and replace others with a dot
  return (
    <>
      {value >= 32 && value <= 126 ? String.fromCharCode(value) : "."}
      {addBreak && <br />}
    </>
  );
} 