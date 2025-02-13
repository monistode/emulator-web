"use client";

import { useProcessor } from "@/util/processor";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useState, memo, CSSProperties } from "react";
import { BinaryDisplay } from "@/components/ui/binary-display";
import { AsciiDisplay } from "@/components/ui/ascii-display";
import { FixedSizeList as List } from "react-window";

type DisplayType = "hex" | "dec" | "bin" | "ascii";

function formatValue(value: number, type: DisplayType): React.ReactNode {
  switch (type) {
    case "hex":
      return "0x" + value.toString(16).padStart(4, "0");
    case "dec":
      return value.toString();
    case "bin":
      return <BinaryDisplay value={value} bits={16} />;
    case "ascii":
      return <AsciiDisplay value={value} />;
  }
}

export function Stack() {
  const { stack } = useProcessor();
  const [displayType, setDisplayType] = useState<DisplayType>("hex");

  const StackItem = memo(
    ({ index, style }: { index: number; style: CSSProperties }) => {
      const value = stack.peek(index);
      if (value === null) return null;

      return (
        <div className="flex justify-between items-center px-4" style={style}>
          <div className="font-mono space-x-2">
            <span>{index}</span>
            <span className="text-muted-foreground">
              0x{index.toString(16).padStart(4, "0")}
            </span>
          </div>
          <span className="font-mono">{formatValue(value, displayType)}</span>
        </div>
      );
    }
  );
  StackItem.displayName = "StackItem";

  return (
    <>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Stack</CardTitle>
          <ToggleGroup
            type="single"
            value={displayType}
            onValueChange={(value) =>
              value && setDisplayType(value as DisplayType)
            }
            className="justify-start"
          >
            <ToggleGroupItem value="hex" size="sm">
              Hex
            </ToggleGroupItem>
            <ToggleGroupItem value="dec" size="sm">
              Dec
            </ToggleGroupItem>
            <ToggleGroupItem value="bin" size="sm">
              Bin
            </ToggleGroupItem>
            <ToggleGroupItem value="ascii" size="sm">
              ASCII
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent>
        <List
          height={200}
          itemCount={1000}
          itemSize={35}
          width="100%"
          className="scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-900"
        >
          {StackItem}
        </List>
      </CardContent>
    </>
  );
}
