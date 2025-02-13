"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useProcessor } from "@/util/processor";
import { useRouter } from "next/navigation";
import { ProcessorType } from "monistode-emulator-bindings";
import { toast } from "sonner";
import { useAssemblerInit } from "@/util/assembler";

export function InteractiveCode({
  initialCode,
  architecture = ProcessorType.Stack,
}: {
  initialCode: string;
  architecture?: ProcessorType;
}) {
  const [isBuilding, setIsBuilding] = useState(false);
  const [code, setCode] = useState(initialCode);
  const { upload } = useProcessor();
  const router = useRouter();
  const assembler = useAssemblerInit();

  const buildCode = async (source: string, arch: ProcessorType) => {
    if (!assembler) {
      throw new Error("Assembler not initialized");
    }

    const target = {
      [ProcessorType.Stack]: assembler.Target.Stack,
      [ProcessorType.Acc]: assembler.Target.Risc, // TODO
      [ProcessorType.Risc]: assembler.Target.Risc,
      [ProcessorType.Cisc]: assembler.Target.Risc,
    }[arch];

    const object = assembler.assemble(source, target);
    const executable = assembler.WasmExecutable.from_object_file(object);
    return executable.serialize();
  };

  const handleRun = async () => {
    setIsBuilding(true);
    try {
      const binary = await buildCode(code, architecture);
      await upload(binary, architecture);
      router.push("/");
    } catch (e) {
      if (e instanceof String) {
        toast.error("Failed to build and run code", {
          description: e,
        });
      } else {
        toast.error("Failed to build and run code");
        console.error(e);
      }
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <Card className="my-4">
      <div className="relative">
        <Textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="font-mono min-h-[100px] resize-none p-4 bg-neutral-900 rounded-b-none"
        />
        <Button
          variant="default"
          size="sm"
          onClick={handleRun}
          disabled={isBuilding || !assembler}
          className="absolute top-2 right-2"
        >
          {!assembler ? "Initializing..." : "Run in emulator"}
        </Button>
      </div>
    </Card>
  );
}

