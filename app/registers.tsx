import { useEffect, useState } from "react";
import { Runner } from "monistode-emulator-bindings";

type RetrievedRegisterState = {
  name: string;
  value: number;
};

enum RegisterDisplayMode {
  Decimal,
  Hexadecimal,
  Binary,
}

function Register({ state }: { state: RetrievedRegisterState }) {
  const [mode, setMode] = useState(RegisterDisplayMode.Hexadecimal);

  return (
    <div className="bg-gray-900 hover:bg-gray-800 p-1 rounded flex flex-row gap-2 items-center justify-between">
      <span className="font-bold p-1">{state.name}</span>
      <div className="bg-gray-950 p-1 rounded font-mono flex flex-row gap-1">
        <span className="mr-4">
          <span className="text-gray-500">
            {mode === RegisterDisplayMode.Decimal
              ? ""
              : mode === RegisterDisplayMode.Hexadecimal
              ? "0x"
              : "0b"}
          </span>
          {mode === RegisterDisplayMode.Decimal
            ? state.value
            : mode === RegisterDisplayMode.Hexadecimal
            ? state.value.toString(16).padStart(4, "0")
            : state.value.toString(2).padStart(16, "0")}
        </span>
        <button
          className={`rounded font-bold text-sm ${
            mode === RegisterDisplayMode.Decimal
              ? "text-gray-400"
              : "text-gray-700 hover:text-gray-500"
          }`}
          onClick={() => setMode(RegisterDisplayMode.Decimal)}
        >
          DEC
        </button>
        <button
          className={`rounded font-bold text-sm ${
            mode === RegisterDisplayMode.Hexadecimal
              ? "text-gray-400"
              : "text-gray-700 hover:text-gray-500"
          }`}
          onClick={() => setMode(RegisterDisplayMode.Hexadecimal)}
        >
          HEX
        </button>
        <button
          className={`rounded font-bold text-sm ${
            mode === RegisterDisplayMode.Binary
              ? "text-gray-400"
              : "text-gray-700 hover:text-gray-500"
          }`}
          onClick={() => setMode(RegisterDisplayMode.Binary)}
        >
          BIN
        </button>
      </div>
    </div>
  );
}

export default function Registers({
  runner,
  nonce,
}: {
  runner: Runner;
  nonce: number;
}) {
  const [registers, setRegisters] = useState<RetrievedRegisterState[]>([]);

  useEffect(() => {
    setRegisters(
      runner.get_registers().map((register) => ({
        name: register.name(),
        value: register.value(),
      }))
    );
  }, [runner, nonce]);

  return (
    <div className="bg-gray-950 p-2 rounded flex-1 flex flex-col gap-2 items-stretch">
      <span className="text-gray-400 self-center">Registers</span>
      {registers.map((register) => (
        <Register state={register} key={register.name} />
      ))}
    </div>
  );
}
