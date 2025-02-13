"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { ProcessorType } from "monistode-emulator-bindings";
import init, {
  assemble,
  Target,
  WasmExecutable,
} from "monistode-binutils-bindings";

const wasmInitPromise = init();

const defaultCode = `.text
start:
halt`;

type Example = {
  id: string;
  name: string;
  code: string;
  description: string;
  architecture: ProcessorType;
};

const examples: Example[] = [
  {
    id: "risc-hello-world",
    name: "Hello World",
    architecture: ProcessorType.Risc,
    code: `.text
_start:
    mov %R00, 'H'
    out 0, %R00
    mov %R00, 'e'
    out 0, %R00
    mov %R00, 'l'
    out 0, %R00
    mov %R00, 'l'
    out 0, %R00
    mov %R00, 'o'
    out 0, %R00
    mov %R00, ','
    out 0, %R00
    mov %R00, ' '
    out 0, %R00
    mov %R00, 'W'
    out 0, %R00
    mov %R00, 'o'
    out 0, %R00
    mov %R00, 'r'
    out 0, %R00
    mov %R00, 'l'
    out 0, %R00
    mov %R00, 'd'
    out 0, %R00
    mov %R00, '!'
    halt`,
    description: "A simple program that outputs 'Hello, World!' to port 0",
  },
  {
    id: "stack-hello-world",
    name: "Hello World",
    architecture: ProcessorType.Stack,
    code: `.text
_start:
    mov 'H'
    out 0
    mov 'e'
    out 0
    mov 'l'
    out 0
    mov 'l'
    out 0
    mov 'o'
    out 0
    mov ','
    out 0
    mov ' '
    out 0
    mov 'W'
    out 0
    mov 'o'
    out 0
    mov 'r'
    out 0
    mov 'l'
    out 0
    mov 'd'
    out 0
    mov '!'
    halt`,
    description: "A simple program that outputs 'Hello, World!' to port 0",
  },
];

type AssemblerContext = {
  code: string;
  setCode: (code: string) => void;
  examples: Example[];
  processorType: ProcessorType;
  setProcessorType: (type: ProcessorType) => void;
  build: () => Promise<{
    success: boolean;
    error?: string;
    binary?: Uint8Array;
  }>;
};

const AssemblerContext = createContext<AssemblerContext>({
  code: defaultCode,
  setCode: () => {},
  examples,
  processorType: ProcessorType.Risc,
  setProcessorType: () => {},
  build: async () => ({ success: false }),
});

export function AssemblerProvider({ children }: { children: React.ReactNode }) {
  const [code, setCode] = useState(defaultCode);
  const [processorType, setProcessorType] = useState<ProcessorType>(
    ProcessorType.Risc
  );

  const build = useCallback(async () => {
    try {
      await wasmInitPromise;
      const target = {
        [ProcessorType.Stack]: Target.Stack,
        [ProcessorType.Acc]: Target.Risc, // TODO
        [ProcessorType.Risc]: Target.Risc,
        [ProcessorType.Cisc]: Target.Risc,
      }[processorType];

      const object = assemble(code, target);
      const executable = WasmExecutable.from_object_file(object);
      const binary = executable.serialize();

      return {
        success: true,
        binary,
      };
    } catch (e) {
      return {
        success: false,
        error: e as string,
      };
    }
  }, [code, processorType]);

  return (
    <AssemblerContext.Provider
      value={{
        code,
        setCode,
        examples,
        processorType,
        setProcessorType,
        build,
      }}
    >
      {children}
    </AssemblerContext.Provider>
  );
}

export const useAssembler = () => useContext(AssemblerContext);
