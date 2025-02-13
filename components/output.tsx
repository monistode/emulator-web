"use client";

import { useIO } from "@/util/io";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useState } from "react";
import { BinaryDisplay } from "@/components/ui/binary-display";
import { AsciiDisplay } from "@/components/ui/ascii-display";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

type DisplayType = "ascii" | "hex" | "dec" | "bin";

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
  port,
  values,
  globalDisplayType,
  showLocalOverride,
}: {
  port: number;
  values: number[];
  globalDisplayType: DisplayType;
  showLocalOverride: boolean;
}) {
  const [localDisplayType, setLocalDisplayType] = useState<DisplayType | null>(
    null
  );

  const displayType = localDisplayType ?? globalDisplayType;

  return (
    <div className="space-y-1">
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
      <div
        className={cn(
          "font-mono text-sm",
          displayType === "ascii"
            ? "flex flex-row flex-wrap gap-0"
            : "space-x-1"
        )}
      >
        {values.map((value, i) => (
          <span key={i}>
            {formatValue(value, displayType)}
            {displayType === "ascii" && value === 10 && <br />}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Output() {
  const { outputs, usedPorts } = useIO();
  const [globalDisplayType, setGlobalDisplayType] =
    useState<DisplayType>("ascii");

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
      <CardContent>
        <Tabs defaultValue="output" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="input">Input</TabsTrigger>
            <TabsTrigger value="output">Output</TabsTrigger>
          </TabsList>
          <TabsContent value="input">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Input is not supported in the current version of the emulator.
              </AlertDescription>
            </Alert>
          </TabsContent>
          <TabsContent value="output">
            <div
              className={cn(
                "rounded-lg border-2 border-dashed border-muted-foreground/25 p-4",
                usedPorts.length === 0 &&
                  "flex items-center justify-center h-20"
              )}
            >
              {usedPorts.length === 0 ? (
                <span className="text-muted-foreground">No output</span>
              ) : (
                <div className="space-y-4">
                  {usedPorts.map((port) => (
                    <PortOutput
                      key={port}
                      port={port}
                      values={outputs.get(port) || []}
                      globalDisplayType={globalDisplayType}
                      showLocalOverride={usedPorts.length > 1}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
