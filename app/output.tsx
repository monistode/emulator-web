import { useMemo, useState } from "react";

export type Item = {
  port: number;
  value: number;
};

enum DisplayMode {
  Hex,
  Decimal,
  Binary,
  ASCII,
}

function Port({ port_id, items }: { port_id: number; items: number[] }) {
  const [mode, setMode] = useState(DisplayMode.Hex);

  return (
    <div className="flex flex-col gap-2 bg-gray-900 rounded p-2">
      <div className="flex flex-row items-center justify-between">
        <span className="font-bold">Port {port_id}</span>
        <div className="flex flex-row gap-2 bg-gray-950 rounded p-1 font-mono">
          <button
            className={`rounded font-bold text-sm ${
              mode === DisplayMode.Decimal
                ? "text-gray-400"
                : "text-gray-700 hover:text-gray-500"
            }`}
            onClick={() => setMode(DisplayMode.Decimal)}
          >
            DEC
          </button>
          <button
            className={`rounded font-bold text-sm ${
              mode === DisplayMode.Hex
                ? "text-gray-400"
                : "text-gray-700 hover:text-gray-500"
            }`}
            onClick={() => setMode(DisplayMode.Hex)}
          >
            HEX
          </button>
          <button
            className={`rounded font-bold text-sm ${
              mode === DisplayMode.Binary
                ? "text-gray-400"
                : "text-gray-700 hover:text-gray-500"
            }`}
            onClick={() => setMode(DisplayMode.Binary)}
          >
            BIN
          </button>
          <button
            className={`rounded font-bold text-sm ${
              mode === DisplayMode.ASCII
                ? "text-gray-400"
                : "text-gray-700 hover:text-gray-500"
            }`}
            onClick={() => setMode(DisplayMode.ASCII)}
          >
            ASCII
          </button>
        </div>
      </div>
      <textarea
        className="bg-gray-900 rounded p-2 font-mono"
        readOnly
        value={items
          .map((item) => {
            switch (mode) {
              case DisplayMode.Decimal:
                return item.toString(10);
              case DisplayMode.Hex:
                return item.toString(16).padStart(4, "0");
              case DisplayMode.Binary:
                return item.toString(2).padStart(16, "0");
              case DisplayMode.ASCII:
                return String.fromCharCode(item);
            }
          })
          .join(mode === DisplayMode.ASCII ? "" : ", ")}
      />
    </div>
  );
}

export default function Output({ items }: { items: Item[] }) {
  const ports = useMemo(() => {
    let ports: { [key: number]: number[] } = {};
    items.forEach((item) => {
      if (ports[item.port] === undefined) {
        ports[item.port] = [];
      }
      ports[item.port].push(item.value);
    });
    return ports;
  }, [items]);

  return (
    <div className="bg-gray-950 flex flex-col gap-2 m-4 p-2 rounded">
      <span className="text-gray-400 self-center">Output</span>
      <div className="flex flex-col gap-4">
        {Object.keys(ports).length ? (
          Object.keys(ports).map((port_id) => (
            <Port
              port_id={parseInt(port_id)}
              items={ports[parseInt(port_id)]}
              key={port_id}
            />
          ))
        ) : (
          <span className="text-gray-700 self-center">No output</span>
        )}
      </div>
    </div>
  );
}
