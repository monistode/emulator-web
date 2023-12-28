import {
  Runner,
  WasmProcessorContinue,
  available_processors,
  ProcessorType,
} from "monistode-emulator-bindings";
import { Item } from "./output";
import {
  VscDebugRestart,
  VscDebugStart,
  VscDebugStepOver,
  VscDebugStop,
} from "react-icons/vsc";
import { Tooltip } from "react-tooltip";
import { useDropzone } from "react-dropzone";
import { useCallback, useEffect, useState } from "react";
import Select from "react-select";

function ExecutableUploader({
  processorType,
  setProcessor,
  setRunning,
  setLast,
}: {
  processorType: ProcessorType;
  setProcessor: (processor: Runner) => void;
  setRunning: (running: boolean) => void;
  setLast: (last: Uint8Array) => void;
}) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length !== 1) {
      return;
    }
    const file = acceptedFiles[0];
    // Now we get a uint8array from the file
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const array = new Uint8Array(arrayBuffer);
      setLast(array);
      setProcessor(new Runner(processorType, array));
      setRunning(true);
    };
    reader.readAsArrayBuffer(file);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div
      className="flex flex-col gap-2 p-4 bg-gray-950 rounded cursor-pointer"
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <span>Drop the files here ...</span>
      ) : (
        <span className="font-bold">Upload executable</span>
      )}
    </div>
  );
}

function ProcessorTypeChooser({
  processorType,
  setProcessorType,
}: {
  processorType: ProcessorType;
  setProcessorType: (processorType: ProcessorType) => void;
}) {
  return (
    <Select
      unstyled
      classNames={{
        control: () => "bg-gray-950 p-2 rounded border border-gray-700",
        menu: () => "bg-gray-950 rounded",
        option: () => "bg-gray-950 hover:bg-gray-800 p-2 rounded",
        singleValue: () => "bg-gray-950",
      }}
      options={available_processors().map((processor) => ({
        value: processor.type_(),
        label: processor.name(),
      }))}
      value={{
        value: processorType,
        label:
          available_processors()
            .find((processor) => processor.type_() === processorType)
            ?.name() ?? "Unknown",
      }}
      onChange={(option) => {
        if (option === null) {
          return;
        }
        setProcessorType(option.value);
      }}
    />
  );
}

export default function Controls({
  processorType,
  setProcessorType,
  processor,
  setProcessor,
  setOutputs,
  refresh,
  running,
  setRunning,
}: {
  processorType: ProcessorType;
  setProcessorType: (processorType: ProcessorType) => void;
  processor: Runner | null;
  setProcessor: (processor: Runner) => void;
  setOutputs: (set: (items: Item[]) => Item[]) => void;
  refresh: () => void;
  running: boolean;
  setRunning: (running: boolean) => void;
}) {
  const [last, setLast] = useState<Uint8Array | null>(null);
  const [stop, setStop] = useState<{ stop: () => void } | null>(null);
  const output = (port: number, value: number) => {
    setOutputs((outputs) => [...outputs, { port, value }]);
  };
  const input = (port: number) => {
    return 0;
  };

  useEffect(() => {
    setStop(null);
  }, [processor]);

  return (
    <div className="flex flex-row p-4 gap-4 justify-evenly items-center">
      <ExecutableUploader
        processorType={processorType}
        setProcessor={setProcessor}
        setRunning={setRunning}
        setLast={setLast}
      />
      <ProcessorTypeChooser
        processorType={processorType}
        setProcessorType={setProcessorType}
      />
      <span className="flex-grow" />
      {running ? null : <span className="text-gray-500">Halted</span>}
      <button
        className={`rounded p-2 bg-gray-700 ${
          running ? "text-gray-500" : "hover:bg-gray-800"
        }`}
        onClick={() => {
          if (last !== null) {
            setProcessor(new Runner(processorType, last));
            setRunning(true);
          }
        }}
        data-tooltip-id="button-hints"
        data-tooltip-content="Restart"
      >
        <VscDebugRestart />
      </button>
      <button
        className={`rounded p-2 bg-gray-700 ${
          running ? "hover:bg-gray-800" : "text-gray-500"
        }`}
        onClick={() => {
          const state = processor?.run(output, input);
          if (state === WasmProcessorContinue.Halt) {
            setRunning(false);
          }
          refresh();
        }}
        data-tooltip-id="button-hints"
        data-tooltip-content="Run next instruction"
      >
        <VscDebugStepOver />
      </button>
      <button
        className={`rounded p-2 bg-gray-700 ${
          running ? "hover:bg-gray-800" : "text-gray-500"
        }`}
        onClick={() => {
          let running = { running: true };

          setStop({
            stop: () => {
              running.running = false;
            },
          });

          const run = () => {
            if (running.running) {
              const result = processor!.run_n(output, input, 10000);
              if (result === WasmProcessorContinue.Continue) {
                setTimeout(run, 0);
              } else {
                setRunning(false);
                setStop(null);
              }
            } else {
              setStop(null);
            }
          };

          run();
        }}
        data-tooltip-id="button-hints"
        data-tooltip-content="Run"
      >
        <VscDebugStart />
      </button>
      <button
        className={`rounded p-2 bg-gray-700 ${
          running && stop ? "hover:bg-gray-800" : "text-gray-500"
        }`}
        onClick={() => {
          if (stop) {
            stop.stop();
          }
        }}
        data-tooltip-id="button-hints"
        data-tooltip-content="Stop"
      >
        <VscDebugStop />
      </button>
      <Tooltip id="button-hints" />
    </div>
  );
}
