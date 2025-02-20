"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { ProcessorType } from "monistode-emulator-bindings";
import init, {
  assemble,
  Target,
  WasmExecutable,
} from "monistode-binutils-bindings";

const initPromise = init().then(() => ({
  assemble,
  WasmExecutable,
  Target,
}));

export function useAssemblerInit() {
  const [assembler, setAssembler] = useState<{
    assemble: typeof assemble;
    WasmExecutable: typeof WasmExecutable;
    Target: typeof Target;
  } | null>(null);

  useEffect(() => {
    initPromise.then(setAssembler);
  }, []);

  return assembler;
}

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
  {
    id: "stack-cat",
    name: "Cat",
    architecture: ProcessorType.Stack,
    code: `.text
_start:
    in 0 # input a value
    dup
    cmpe 0 # see if we got anything - the UI returns a null character if not
    jc looparound # if it is equal to 0 - skip this character
    out 0
    jmp _start
    # probably a good idea to keep the top of stack where it is - just for convenience
    push
looparound: # here because of a bug in the linker - TODO fix, sorry
    pop %FR # sure - why not fill the flag register with zeroes
    jmp _start`,
    description: "A program that reads input from port 0 and echoes it back to port 0",
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
  isInitialized: boolean;
};

const AssemblerContext = createContext<AssemblerContext>({
  code: defaultCode,
  setCode: () => {},
  examples,
  processorType: ProcessorType.Risc,
  setProcessorType: () => {},
  build: async () => ({ success: false }),
  isInitialized: false,
});

export function AssemblerProvider({ children }: { children: React.ReactNode }) {
  const [code, setCode] = useState(defaultCode);
  const [processorType, setProcessorType] = useState<ProcessorType>(
    ProcessorType.Risc
  );
  const assembler = useAssemblerInit();

  const build = useCallback(async () => {
    if (!assembler) {
      return {
        success: false,
        error: "Assembler not initialized",
      };
    }

    try {
      const target = {
        [ProcessorType.Stack]: assembler.Target.Stack,
        [ProcessorType.Acc]: assembler.Target.Risc, // TODO
        [ProcessorType.Risc]: assembler.Target.Risc,
        [ProcessorType.Cisc]: assembler.Target.Risc,
      }[processorType];

      const object = assembler.assemble(code, target);
      const executable = assembler.WasmExecutable.from_object_file(object);
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
  }, [code, processorType, assembler]);

  return (
    <AssemblerContext.Provider
      value={{
        code,
        setCode,
        examples,
        processorType,
        setProcessorType,
        build,
        isInitialized: !!assembler,
      }}
    >
      {children}
    </AssemblerContext.Provider>
  );
}

export const useAssembler = () => useContext(AssemblerContext);
