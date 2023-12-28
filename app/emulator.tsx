"use client";
import init, { Runner, ProcessorType } from "monistode-emulator-bindings";
import { useEffect, useState } from "react";
import Controls from "./controls";
import MemoryGrid from "./memory";
import Output, { Item } from "./output";
import Registers from "./registers";

function Emulator() {
  const [processorType, setProcessorType] = useState<ProcessorType>(
    ProcessorType.Stack
  );
  const [processor, setProcessor] = useState<Runner | null>(null);
  const [outputs, setOutputs] = useState<Item[]>([]);
  const [nonce, setNonce] = useState(0);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    setOutputs([]);
    if (processor === null) {
      const processor = new Runner(
        ProcessorType.Stack,
        Uint8Array.from([1, 0, 0, 0, 0])
      );
      setProcessor(processor);
    }
  }, [processor]);

  return (
    <div className="flex flex-col bg-gray-900 m-4 rounded">
      <Controls
        processorType={processorType}
        setProcessorType={setProcessorType}
        processor={processor}
        setProcessor={setProcessor}
        setOutputs={setOutputs}
        refresh={() => setNonce(nonce + 1)}
        running={running}
        setRunning={setRunning}
      />
      <div className="flex flex-row p-4 gap-4 justify-between align-stretch">
        {processor && <MemoryGrid runner={processor} />}
        {processor && <Registers runner={processor} nonce={nonce} />}
      </div>
      {processor && <Output items={outputs} />}
    </div>
  );
}

export default function InitializedEmulator() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const init_processor = async () => {
      if (!initialized) {
        await init();
        setInitialized(true);
      }
    };
    init_processor();
  }, [initialized]);

  return initialized ? <Emulator /> : <div>Initializing...</div>;
}
