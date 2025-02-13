"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProcessorType } from "monistode-emulator-bindings";
import { useAssembler } from "@/util/assembler";
import { useProcessor } from "@/util/processor";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronsUpDown, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default function AssemblerPage() {
  const { code, setCode, examples, processorType, setProcessorType, build } =
    useAssembler();
  const { upload } = useProcessor();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [buildResult, setBuildResult] = useState<{
    success: boolean;
    error?: string;
    binary?: Uint8Array;
  } | null>(null);

  const handleBuild = async () => {
    const result = await build();
    setBuildResult(result);
    setOpen(true);
  };

  const handleDownload = () => {
    if (buildResult?.binary) {
      const blob = new Blob([buildResult.binary], {
        type: "application/octet-stream",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "program.bin";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleRun = () => {
    if (buildResult?.binary) {
      upload(buildResult.binary, processorType);
      router.push("/");
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-6xl">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          This is a work in progress. Not all assembly syntax features are
          supported yet. Please refer to the examples for supported syntax.
        </AlertDescription>
      </Alert>

      <Card className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <Select
              value={ProcessorType[processorType]}
              onValueChange={(value) =>
                setProcessorType(
                  ProcessorType[value as keyof typeof ProcessorType]
                )
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select architecture" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Stack">Stack</SelectItem>
                <SelectItem value="Acc">Accumulator</SelectItem>
                <SelectItem value="Risc">RISC</SelectItem>
                <SelectItem value="Cisc">CISC</SelectItem>
              </SelectContent>
            </Select>

            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-[200px] justify-between"
                >
                  Select example...
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search examples..." />
                  <CommandEmpty>No example found.</CommandEmpty>
                  <CommandList>
                    <CommandGroup>
                      {examples
                        .sort((a, b) => {
                          // Sort by architecture match first, then by name
                          if (
                            a.architecture === processorType &&
                            b.architecture !== processorType
                          )
                            return -1;
                          if (
                            a.architecture !== processorType &&
                            b.architecture === processorType
                          )
                            return 1;
                          return a.name.localeCompare(b.name);
                        })
                        .map((example) => (
                          <CommandItem
                            key={example.id}
                            value={example.id}
                            onSelect={() => {
                              setProcessorType(example.architecture);
                              setCode(example.code);
                              setComboboxOpen(false);
                            }}
                          >
                            <div className="flex flex-col">
                              <div>{example.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {ProcessorType[example.architecture]}
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <Button onClick={handleBuild}>Build</Button>
        </div>
      </Card>

      <Card className="flex-1">
        <Textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="font-mono min-h-[500px] resize-none p-4 bg-background"
        />
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className={cn(
            buildResult?.success ? undefined : "border-red-900 bg-red-950"
          )}
        >
          <DialogHeader>
            <DialogTitle>
              {buildResult?.success ? "Build Successful" : "Build Failed"}
            </DialogTitle>
            <DialogDescription>
              {buildResult?.success ? (
                "Your code has been successfully assembled. What would you like to do?"
              ) : (
                <pre className="mt-2 w-[440px] rounded-lg border bg-red-900/50 p-4 font-mono text-white">
                  {buildResult?.error}
                </pre>
              )}
            </DialogDescription>
          </DialogHeader>
          {buildResult?.success ? (
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="outline" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button onClick={handleRun}>Open in emulator</Button>
            </DialogFooter>
          ) : (
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="border-red-800 hover:bg-red-900/50"
              >
                Close
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
