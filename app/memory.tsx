import { MemoryBlock, Runner } from "monistode-emulator-bindings";
import { useEffect, useMemo, useState } from "react";
import HexEditor from "react-hex-editor";
import oneDarkPro from "react-hex-editor/themes/oneDarkPro";

function MemoryGridBlock({
  runner,
  block,
}: {
  runner: Runner;
  block: MemoryBlock;
}) {
  let data = useMemo(() => block.values(), [block]);
  const [nonce, setNonce] = useState(0);

  return (
    <div className="flex flex-col gap-1 bg-gray-900 rounded p-2">
      <span className="text-gray-400">{block.cell_type_name()}</span>
      <div className="px-2 min-h-[200px]">
        <HexEditor
          className="rounded"
          columns={0x20}
          data={data}
          nonce={nonce}
          onSetValue={(offset: number, value: number) => {
            if (runner.set_memory(block.cell_type(), offset, value)) {
              data[offset] = value;
              setNonce(nonce + 1);
            }
          }}
          theme={{ hexEditor: oneDarkPro }}
        />
      </div>
    </div>
  );
}

export default function MemoryGrid({ runner }: { runner: Runner }) {
  const [data, setData] = useState<MemoryBlock[]>([]);

  useEffect(() => {
    setData(runner.get_memory());
  }, [runner]);

  return (
    <div className="bg-gray-950 p-2 rounded flex flex-col gap-2 items-center">
      <span className="text-gray-400">Program memory</span>
      <div className="flex flex-col gap-4">
        {data.map((cell) => (
          <MemoryGridBlock
            runner={runner}
            block={cell}
            key={cell.cell_type()}
          />
        ))}
      </div>
    </div>
  );
}
