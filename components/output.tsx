"use client";

import { useIO } from "@/util/io";
import type { PortInput } from "@/util/io";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useState } from "react";
import { BinaryDisplay } from "@/components/ui/binary-display";
import { AsciiDisplay } from "@/components/ui/ascii-display";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type DisplayType = "ascii" | "hex" | "dec" | "bin";
type InputMode = "dec" | "hex" | "bin" | "string";

function formatValue(value: number, type: DisplayType): React.ReactNode {
  switch (type) {
    case "ascii":
      return <AsciiDisplay value={value} />;
    case "hex":
      return "0x" + value.toString(16).padStart(4, "0");
    case "dec":
      return value.toString();
    case "bin":
      return <BinaryDisplay value={value} bits={16} />;
  }
}

function PortOutput({
  values,
  displayType,
}: {
  values: number[];
  displayType: DisplayType;
}) {
  // Group values into lines for ASCII mode
  const lines =
    displayType === "ascii"
      ? values.reduce((acc: number[][], value) => {
          if (value === 10) {
            // Add newline to current line and start a new one
            if (acc.length === 0) acc.push([]);
            acc[acc.length - 1].push(value);
            acc.push([]);
          } else {
            // Add to current line
            if (acc.length === 0) acc.push([]);
            acc[acc.length - 1].push(value);
          }
          return acc;
        }, [])
      : [values];

  return (
    <div
      className={cn(
        "font-mono text-sm",
        displayType === "ascii" ? "flex flex-row flex-wrap gap-0" : "space-x-1"
      )}
    >
      {lines.map((line, i) => (
        <span key={i} className="basis-full">
          {line.map((value, j) => (
            <span key={j}>{formatValue(value, displayType)}</span>
          ))}
        </span>
      ))}
    </div>
  );
}

function validateInput(
  value: string,
  mode: InputMode
): { isValid: boolean; parsedValue?: number } {
  if (!value.trim()) return { isValid: false };

  try {
    let num: number;
    switch (mode) {
      case "dec":
        num = parseInt(value, 10);
        break;
      case "hex":
        num = parseInt(value.replace(/^0x/i, ""), 16);
        break;
      case "bin":
        num = parseInt(value.replace(/^0b/i, ""), 2);
        break;
      case "string":
        return { isValid: true };
      default:
        return { isValid: false };
    }
    if (!isNaN(num) && num >= 0 && num <= 65535) {
      return { isValid: true, parsedValue: num };
    }
  } catch {}
  return { isValid: false };
}

function PortInputComponent({
  port,
  input,
}: {
  port: number;
  input: PortInput;
}) {
  const { queueInput } = useIO();
  const [inputMode, setInputMode] = useState<InputMode>("dec");
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (inputValue.trim() === "") {
      setError("Please enter a value");
      return;
    }

    if (inputMode === "string") {
      const chars = inputValue.split("");
      chars.forEach((char) => {
        queueInput(port, char.charCodeAt(0));
      });
      setInputValue("");
    } else {
      const { isValid, parsedValue } = validateInput(inputValue, inputMode);
      if (!isValid) {
        setError(
          inputMode === "dec"
            ? "Please enter a valid decimal number (0-65535)"
            : inputMode === "hex"
            ? "Please enter a valid hex number (0x0000-0xFFFF)"
            : "Please enter a valid binary number (0b0000-0b1111111111111111)"
        );
        return;
      }
      queueInput(port, parsedValue!);
      setInputValue("");
    }
  };

  const handleModeChange = (value: string | undefined) => {
    if (!value) return;
    setInputMode(value as InputMode);
    setError(null);
  };

  return (
    <div
      className={cn(
        "space-y-1",
        input.lastFetched && "ring-1 ring-primary rounded-lg p-2"
      )}
    >
      <form onSubmit={handleInputSubmit} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <ToggleGroup
            type="single"
            value={inputMode}
            onValueChange={handleModeChange}
            className="justify-start"
          >
            <ToggleGroupItem value="dec" size="sm">
              Dec
            </ToggleGroupItem>
            <ToggleGroupItem value="hex" size="sm">
              Hex
            </ToggleGroupItem>
            <ToggleGroupItem value="bin" size="sm">
              Bin
            </ToggleGroupItem>
            <ToggleGroupItem value="string" size="sm">
              String
            </ToggleGroupItem>
          </ToggleGroup>
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError(null);
            }}
            placeholder={
              inputMode === "dec"
                ? "123..."
                : inputMode === "hex"
                ? "0xFF..."
                : inputMode === "bin"
                ? "0b1010..."
                : "Enter text..."
            }
            className={cn("flex-1", error && "border-destructive")}
          />
          <Button type="submit" size="sm">
            Queue
          </Button>
        </div>
        {error && <span className="text-sm text-destructive">{error}</span>}
      </form>
    </div>
  );
}

function Port({
  port,
  outputs,
  inputs,
  globalDisplayType,
  showLocalOverride,
}: {
  port: number;
  outputs: Map<number, number[]>;
  inputs: Map<number, PortInput>;
  globalDisplayType: DisplayType;
  showLocalOverride: boolean;
}) {
  const [localDisplayType, setLocalDisplayType] = useState<DisplayType | null>(
    null
  );
  const displayType = localDisplayType ?? globalDisplayType;

  return (
    <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Port {port}</span>
        <div className="flex-1 h-px bg-border" />
        {showLocalOverride && (
          <ToggleGroup
            type="single"
            value={localDisplayType ?? ""}
            onValueChange={(value) =>
              setLocalDisplayType((value as DisplayType) || null)
            }
            className="justify-start"
          >
            <ToggleGroupItem value="ascii" size="sm">
              ASCII
            </ToggleGroupItem>
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
        )}
      </div>
      {outputs.has(port) && (outputs.get(port)?.length ?? 0) > 0 && (
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground">
            Output:
          </div>
          <PortOutput
            values={outputs.get(port) || []}
            displayType={displayType}
          />
        </div>
      )}
      {inputs.has(port) && (inputs.get(port)?.values.length ?? 0) > 0 && (
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground">
            Input:
          </div>
          <div
            className={cn(
              "font-mono text-sm",
              displayType === "ascii"
                ? "flex flex-row flex-wrap gap-0"
                : "space-x-1"
            )}
          >
            {inputs.get(port)?.values.map((value: number, i: number) => (
              <span key={i}>
                {formatValue(value, displayType)}
                {displayType === "ascii" && value === 10 && <br />}
              </span>
            ))}
          </div>
        </div>
      )}
      <PortInputComponent
        port={port}
        input={inputs.get(port) || { port, values: [], lastFetched: false }}
      />
    </div>
  );
}

export function IO() {
  const { outputs, inputs, usedPorts, initializePort } = useIO();
  const [globalDisplayType, setGlobalDisplayType] =
    useState<DisplayType>("ascii");
  const [newPortValue, setNewPortValue] = useState("");
  const [newPortError, setNewPortError] = useState<string | null>(null);

  const allPorts = Array.from(
    new Set([
      0,
      ...usedPorts,
      ...Array.from(inputs.keys()).filter(
        (port) => port === 0 || (inputs.get(port)?.values.length ?? 0) > 0
      ),
    ])
  ).sort((a, b) => a - b);

  const handleOpenPort = (e: React.FormEvent) => {
    e.preventDefault();
    setNewPortError(null);

    const port = parseInt(newPortValue, 10);
    if (isNaN(port) || port < 0 || port > 65535) {
      setNewPortError("Please enter a valid port number (0-65535)");
      return;
    }

    initializePort(port);
    setNewPortValue("");
  };

  return (
    <Card className="flex-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>IO</CardTitle>
          <ToggleGroup
            type="single"
            value={globalDisplayType}
            onValueChange={(value) =>
              value && setGlobalDisplayType(value as DisplayType)
            }
            className="justify-start"
          >
            <ToggleGroupItem value="ascii" size="sm">
              ASCII
            </ToggleGroupItem>
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
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {allPorts.map((port) => (
            <Port
              key={port}
              port={port}
              outputs={outputs}
              inputs={inputs}
              globalDisplayType={globalDisplayType}
              showLocalOverride={usedPorts.length > 1}
            />
          ))}
        </div>
        <form onSubmit={handleOpenPort} className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Input
              type="number"
              min={0}
              max={65535}
              value={newPortValue}
              onChange={(e) => {
                setNewPortValue(e.target.value);
                setNewPortError(null);
              }}
              placeholder="Enter port number..."
              className={cn("flex-1", newPortError && "border-destructive")}
            />
            <Button type="submit" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Open Port
            </Button>
          </div>
          {newPortError && (
            <span className="text-sm text-destructive">{newPortError}</span>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
