"use client";

import { useProcessor } from "@/util/processor";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useState } from "react";
import { useSelectedByte } from "@/util/selected-byte";
import { RegisterState } from "monistode-emulator-bindings";
import { BinaryDisplay } from "@/components/ui/binary-display";

type DisplayType = "hex" | "dec" | "bin";

function formatValue(value: number, type: DisplayType): React.ReactNode {
  switch (type) {
    case "hex":
      return "0x" + value.toString(16).padStart(4, "0");
    case "dec":
      return value.toString();
    case "bin":
      return <BinaryDisplay value={value} bits={16} />;
  }
}

export function Registers() {
  const { runner } = useProcessor();
  const [displayType, setDisplayType] = useState<DisplayType>("hex");
  const { setSelectedByte } = useSelectedByte();
  const registers = runner?.get_registers() || [];

  return (
    <>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Registers</CardTitle>
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
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1.5">
          {registers.map((register: RegisterState) => (
            <div
              key={register.name()}
              className="flex justify-between items-center"
              onClick={() => setSelectedByte(register.value())}
              role="button"
              tabIndex={0}
            >
              <span className="font-mono">{register.name()}</span>
              <span className="font-mono cursor-pointer hover:text-blue-400">
                {formatValue(register.value(), displayType)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </>
  );
}
