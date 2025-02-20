"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";

// IO Manager handles the actual state, separate from React
class IOManager {
  private outputs: Map<number, number[]> = new Map();
  private inputs: Map<number, PortInput> = new Map();
  private usedPorts: Set<number> = new Set();
  private listeners: Set<() => void> = new Set();

  notify() {
    this.listeners.forEach(listener => listener());
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  clear() {
    this.outputs = new Map();
    this.inputs = new Map();
    this.usedPorts = new Set();
    this.notify();
  }

  handleOutput(port: number, value: number) {
    const portOutput = this.outputs.get(port) || [];
    this.outputs.set(port, [...portOutput, value]);
    this.usedPorts.add(port);
    this.notify();
  }

  queueInput(port: number, value: number) {
    const portInput = this.inputs.get(port);
    if (portInput) {
      portInput.values.push(value);
      portInput.lastFetched = false;
    } else {
      this.inputs.set(port, {
        port,
        values: [value],
        lastFetched: false,
      });
    }
    this.usedPorts.add(port);
    this.notify();
  }

  handleInput(port: number): number {
    // Reset all lastFetched flags
    for (const input of this.inputs.values()) {
      input.lastFetched = false;
    }

    const portInput = this.inputs.get(port);
    if (!portInput || portInput.values.length === 0) {
      return 0;
    }

    const value = portInput.values.shift()!;
    portInput.lastFetched = true;

    // Clean up empty ports (except port 0)
    if (portInput.values.length === 0 && port !== 0) {
      this.inputs.delete(port);
    }

    this.notify();
    return value;
  }

  getState() {
    return {
      outputs: new Map(this.outputs),
      inputs: new Map(this.inputs),
      usedPorts: Array.from(this.usedPorts).sort((a, b) => a - b),
    };
  }

  initializePort(port: number) {
    if (!this.inputs.has(port)) {
      this.inputs.set(port, { port, values: [], lastFetched: false });
      this.usedPorts.add(port);
      this.notify();
    }
  }
}

// Single global instance
const ioManager = new IOManager();

type PortOutput = {
  port: number;
  values: number[];
};

export type PortInput = {
  port: number;
  values: number[];
  lastFetched: boolean;
};

const IOContext = createContext<{
  outputs: Map<number, number[]>;
  inputs: Map<number, PortInput>;
  usedPorts: number[];
  clearIO: () => void;
  handleOutput: (port: number, value: number) => void;
  handleInput: (port: number) => number;
  queueInput: (port: number, value: number) => void;
  initializePort: (port: number) => void;
}>({
  outputs: new Map(),
  inputs: new Map(),
  usedPorts: [],
  clearIO: () => {},
  handleOutput: () => {},
  handleInput: () => 0,
  queueInput: () => {},
  initializePort: () => {},
});

export const IOProvider = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const [state, setState] = useState(() => ioManager.getState());

  useEffect(() => {
    return ioManager.subscribe(() => {
      setState(ioManager.getState());
    });
  }, []);

  const value = {
    ...state,
    clearIO: useCallback(() => ioManager.clear(), []),
    handleOutput: useCallback((port: number, value: number) => ioManager.handleOutput(port, value), []),
    handleInput: useCallback((port: number) => ioManager.handleInput(port), []),
    queueInput: useCallback((port: number, value: number) => ioManager.queueInput(port, value), []),
    initializePort: useCallback((port: number) => ioManager.initializePort(port), []),
  };

  return (
    <IOContext.Provider value={value}>
      {children}
    </IOContext.Provider>
  );
};

export const useIO = () => {
  return useContext(IOContext);
};

