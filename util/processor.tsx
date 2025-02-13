"use client";
import init, {
  Runner,
  ProcessorType,
  MemoryBlock,
  MemoryType,
  WasmProcessorContinue,
} from "monistode-emulator-bindings";
import {
  useEffect,
  useState,
  createContext,
  useContext,
  useCallback,
} from "react";
import { toast } from "sonner";
import { useIO } from "./io";
import { useSelectedByte } from "./selected-byte";

export enum ProcessorStatus {
  Ready, // Initial state or after reset
  Running, // Continuously executing
  Paused, // Execution paused, can continue
  Halted, // Program finished execution
  Errored, // Error occurred during execution
}

const wasmInitPromise = init();

class Stack {
  constructor(private runner: Runner | null) {}

  peek(n: number): number | null {
    if (!this.runner) return null;
    try {
      return this.runner.peek_stack(n);
    } catch {
      return null;
    }
  }
}

type ProcessorState = {
  runner: Runner | null;
  type: ProcessorType;
};

// Create a new context for the processor
const ProcessorContext = createContext<{
  memory: MemoryBlock[];
  status: ProcessorStatus;
  error?: string;
  processorType: ProcessorType;
  runner: Runner | null;
  stack: Stack;
  run: (
    output: (port: number, value: number) => void,
    input: (port: number) => number
  ) => void;
  runN: (
    output: (port: number, value: number) => void,
    input: (port: number) => number,
    n: number
  ) => WasmProcessorContinue;
  setByte: (memType: MemoryType, index: number, value: number) => void;
  upload: (executable: Uint8Array, type: ProcessorType) => void;
  reset: () => void;
  step: () => void;
  startRunning: () => void;
  stopRunning: () => void;
  createProcessor: (type: ProcessorType) => void;
}>({
  memory: [],
  status: ProcessorStatus.Ready,
  processorType: ProcessorType.Risc,
  runner: null,
  stack: new Stack(null),
  run: () => {},
  runN: () => WasmProcessorContinue.Continue,
  setByte: () => {},
  upload: () => {},
  reset: () => {},
  step: () => {},
  startRunning: () => {},
  stopRunning: () => {},
  createProcessor: () => {},
});

// Create the provider
export const ProcessorProvider = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const [processor, setProcessor] = useState<ProcessorState>({
    runner: null,
    type: ProcessorType.Risc,
  });
  const [memory, setMemory] = useState<MemoryBlock[]>([]);
  const [status, setStatus] = useState<ProcessorStatus>(ProcessorStatus.Ready);
  const [error, setError] = useState<string>();
  const [lastExecutable, setLastExecutable] = useState<{
    binary: Uint8Array;
    type: ProcessorType;
  }>();
  const [stack, setStack] = useState(new Stack(null));

  const { handleInput, handleOutput, clearIO } = useIO();
  const { setSelectedByte } = useSelectedByte();

  const createProcessor = useCallback(async (type: ProcessorType) => {
    try {
      await wasmInitPromise;
      const runner = new Runner(type);
      setProcessor({ runner, type });
      setMemory(runner.get_memory());
      setLastExecutable(undefined);
      setStatus(ProcessorStatus.Ready);
      setError(undefined);
      setSelectedByte(null);
      clearIO();
    } catch (e) {
      setError(e as string);
      setStatus(ProcessorStatus.Errored);
      toast.error("Failed to create processor", {
        description: e as string,
      });
    }
  }, [clearIO, setSelectedByte]);

  // Initialize processor
  useEffect(() => {
    createProcessor(ProcessorType.Risc);
  }, [createProcessor]);

  // Update stack when processor changes
  useEffect(() => {
    setStack(new Stack(processor.runner));
  }, [processor, memory]);

  const run = useCallback(
    (
      output: (port: number, value: number) => void,
      input: (port: number) => number
    ) => {
      if (processor.runner) {
        try {
          processor.runner.run(output, input);
          setMemory(processor.runner.get_memory());
          setStatus(ProcessorStatus.Halted);
        } catch (e) {
          setError(e as string);
          setStatus(ProcessorStatus.Errored);
          toast.error("Execution error", {
            description: e as string,
          });
        }
      }
    },
    [processor]
  );

  const runN = useCallback(
    (
      output: (port: number, value: number) => void,
      input: (port: number) => number,
      n: number
    ) => {
      if (!processor.runner) return WasmProcessorContinue.Error;
      try {
        const result = processor.runner.run_n(output, input, n);
        setMemory(processor.runner.get_memory());
        return result;
      } catch (e) {
        setError(e as string);
        setStatus(ProcessorStatus.Errored);
        toast.error("Execution error", {
          description: e as string,
        });
        return WasmProcessorContinue.Error;
      }
    },
    [processor]
  );

  const setByte = useCallback(
    (memType: MemoryType, index: number, value: number) => {
      if (processor.runner) {
        processor.runner.set_memory(memType, index, value);
        setMemory(processor.runner.get_memory());
      }
    },
    [processor]
  );

  const upload = useCallback(
    async (executable: Uint8Array, type: ProcessorType) => {
      try {
        await wasmInitPromise;
        const runner = new Runner(type);
        runner.load_program(executable);
        setProcessor({ runner, type });
        setMemory(runner.get_memory());
        setLastExecutable({ binary: executable, type });
        setStatus(ProcessorStatus.Ready);
        setError(undefined);
        setSelectedByte(null);
        clearIO();
      } catch (e) {
        setError(e as string);
        setStatus(ProcessorStatus.Errored);
        toast.error("Upload error", {
          description: e as string,
        });
      }
    },
    [clearIO, setSelectedByte]
  );

  const reset = useCallback(async () => {
    if (!lastExecutable) return;
    await upload(lastExecutable.binary, lastExecutable.type);
  }, [lastExecutable, upload]);

  const step = useCallback(() => {
    if (!processor.runner) return;
    const result = runN(handleOutput, handleInput, 1);
    switch (result) {
      case WasmProcessorContinue.Continue:
        setStatus(ProcessorStatus.Paused);
        break;
      case WasmProcessorContinue.Halt:
        setStatus(ProcessorStatus.Halted);
        break;
      case WasmProcessorContinue.Error:
        // Error already handled in runN
        break;
    }
  }, [processor, runN, handleInput, handleOutput]);

  // Continuous running
  useEffect(() => {
    if (status !== ProcessorStatus.Running) return;

    let animationFrameId: number;

    const runLoop = () => {
      if (status !== ProcessorStatus.Running) return;

      const result = runN(handleOutput, handleInput, 1000);
      switch (result) {
        case WasmProcessorContinue.Continue:
          animationFrameId = requestAnimationFrame(runLoop);
          break;
        case WasmProcessorContinue.Halt:
          setStatus(ProcessorStatus.Halted);
          break;
        case WasmProcessorContinue.Error:
          setStatus(ProcessorStatus.Errored);
          break;
      }
    };

    animationFrameId = requestAnimationFrame(runLoop);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [status, runN, handleInput, handleOutput]);

  const startRunning = useCallback(() => {
    setStatus(ProcessorStatus.Running);
  }, []);

  const stopRunning = useCallback(() => {
    setStatus(ProcessorStatus.Paused);
  }, []);

  return (
    <ProcessorContext.Provider
      value={{
        memory,
        status,
        error,
        processorType: processor.type,
        runner: processor.runner,
        stack,
        run,
        runN,
        setByte,
        upload,
        reset,
        step,
        startRunning,
        stopRunning,
        createProcessor,
      }}
    >
      {children}
    </ProcessorContext.Provider>
  );
};

// Create the hook
export const useProcessor = () => {
  return useContext(ProcessorContext);
};
