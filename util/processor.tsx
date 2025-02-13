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
  setProcessorType: (type: ProcessorType) => void;
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
  setProcessorType: () => {},
});

// Create the provider
export const ProcessorProvider = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const [processor, setProcessor] = useState<Runner | null>(null);
  const [memory, setMemory] = useState<MemoryBlock[]>([]);
  const [status, setStatus] = useState<ProcessorStatus>(ProcessorStatus.Ready);
  const [error, setError] = useState<string>();
  const [processorType, setProcessorType] = useState<ProcessorType>(
    ProcessorType.Risc
  );
  const [lastExecutable, setLastExecutable] = useState<Uint8Array>();
  const [stack, setStack] = useState(new Stack(null));

  const { handleInput, handleOutput, clearIO } = useIO();
  const { setSelectedByte } = useSelectedByte();

  // Initialize processor
  useEffect(() => {
    wasmInitPromise.then(() => {
      const runner = new Runner(processorType);
      setProcessor(runner);
      setMemory(runner.get_memory());
    });
  }, []);

  // Update stack when processor changes
  useEffect(() => {
    setStack(new Stack(processor));
  }, [processor, memory]);

  const run = useCallback(
    (
      output: (port: number, value: number) => void,
      input: (port: number) => number
    ) => {
      if (processor) {
        try {
          processor.run(output, input);
          setMemory(processor.get_memory());
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
      if (!processor) return WasmProcessorContinue.Error;
      try {
        const result = processor.run_n(output, input, n);
        setMemory(processor.get_memory());
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
      if (processor) {
        processor.set_memory(memType, index, value);
        setMemory(processor.get_memory());
      }
    },
    [processor]
  );

  const upload = useCallback(
    async (executable: Uint8Array, type: ProcessorType) => {
      try {
        await wasmInitPromise;
        const newProcessor = new Runner(type);
        newProcessor.load_program(executable);
        setProcessor(newProcessor);
        setMemory(newProcessor.get_memory());
        setLastExecutable(executable);
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
    await wasmInitPromise;
    const newProcessor = new Runner(processorType);
    if (lastExecutable) {
      try {
        newProcessor.load_program(lastExecutable);
      } catch (e) {
        setError(e as string);
        setStatus(ProcessorStatus.Errored);
        toast.error("Reset error", {
          description: e as string,
        });
        return;
      }
    }
    setProcessor(newProcessor);
    setMemory(newProcessor.get_memory());
    setStatus(ProcessorStatus.Ready);
    setError(undefined);
    setSelectedByte(null);
    clearIO();
  }, [processorType, lastExecutable, clearIO, setSelectedByte]);

  const step = useCallback(() => {
    if (!processor) return;
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

  const handleProcessorTypeChange = useCallback(
    async (type: ProcessorType) => {
      setProcessorType(type);
      await wasmInitPromise;
      const newProcessor = new Runner(type);
      if (lastExecutable) {
        try {
          newProcessor.load_program(lastExecutable);
        } catch (e) {
          setError(e as string);
          setStatus(ProcessorStatus.Errored);
          toast.error("Processor type change error", {
            description: e as string,
          });
          return;
        }
      }
      setProcessor(newProcessor);
      setMemory(newProcessor.get_memory());
      setStatus(ProcessorStatus.Ready);
      setError(undefined);
      setSelectedByte(null);
      clearIO();
    },
    [lastExecutable, clearIO, setSelectedByte]
  );

  return (
    <ProcessorContext.Provider
      value={{
        memory,
        status,
        error,
        processorType,
        runner: processor,
        stack,
        run,
        runN,
        setByte,
        upload,
        reset,
        step,
        startRunning,
        stopRunning,
        setProcessorType: handleProcessorTypeChange,
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
