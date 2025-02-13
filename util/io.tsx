"use client";

import { createContext, useContext, useState, useCallback } from "react";

type PortOutput = {
  port: number;
  values: number[];
};

const IOContext = createContext<{
  outputs: Map<number, number[]>;
  usedPorts: number[];
  clearIO: () => void;
  handleOutput: (port: number, value: number) => void;
  handleInput: (port: number) => number;
}>({
  outputs: new Map(),
  usedPorts: [],
  clearIO: () => {},
  handleOutput: () => {},
  handleInput: () => 0,
});

export const IOProvider = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const [outputs, setOutputs] = useState<Map<number, number[]>>(new Map());
  const [usedPorts, setUsedPorts] = useState<number[]>([]);

  const clearIO = useCallback(() => {
    setOutputs(new Map());
    setUsedPorts([]);
  }, []);

  const handleOutput = useCallback((port: number, value: number) => {
    setOutputs((prev) => {
      const newOutputs = new Map(prev);
      const portOutput = newOutputs.get(port) || [];
      newOutputs.set(port, [...portOutput, value]);
      return newOutputs;
    });
    setUsedPorts((prev) => {
      if (prev.includes(port)) return prev;
      return [...prev, port].sort((a, b) => a - b);
    });
  }, []);

  const handleInput = useCallback((port: number) => {
    // Mock implementation - always return 0
    return 0;
  }, []);

  return (
    <IOContext.Provider
      value={{
        outputs,
        usedPorts,
        clearIO,
        handleOutput,
        handleInput,
      }}
    >
      {children}
    </IOContext.Provider>
  );
};

export const useIO = () => {
  return useContext(IOContext);
};

