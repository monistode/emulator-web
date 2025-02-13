"use client";

import { useProcessor, ProcessorStatus } from "@/util/processor";
import { ProcessorType } from "monistode-emulator-bindings";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Upload,
  RotateCcw,
  Play,
  Square,
  StepForward,
  Code2,
} from "lucide-react";
import { useRef } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";

export function Controls() {
  const {
    status,
    processorType,
    setProcessorType,
    upload,
    reset,
    step,
    startRunning,
    stopRunning,
  } = useProcessor();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const buffer = await file.arrayBuffer();
    upload(new Uint8Array(buffer), processorType);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
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

          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Upload program</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={reset}
                  disabled={status === ProcessorStatus.Ready}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset program</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={step}
                  disabled={
                    status !== ProcessorStatus.Ready &&
                    status !== ProcessorStatus.Paused
                  }
                >
                  <StepForward className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Step forward</p>
              </TooltipContent>
            </Tooltip>

            {status !== ProcessorStatus.Running ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={startRunning}
                    disabled={
                      status !== ProcessorStatus.Ready &&
                      status !== ProcessorStatus.Paused
                    }
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Run program</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={stopRunning}>
                    <Square className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Stop program</p>
                </TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => router.push("/assembler")}
                >
                  <Code2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open assembler</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      {status === ProcessorStatus.Errored && (
        <div className="flex items-center justify-center text-red-500 text-sm bg-red-500/10 rounded-md py-1">
          Execution error - reset to continue
        </div>
      )}
    </div>
  );
}

