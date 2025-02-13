"use client";
import { useProcessor } from "@/util/processor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MemoryBlock } from "monistode-emulator-bindings";
import { FixedSizeList as List } from "react-window";
import { useState, useEffect, useRef, useCallback } from "react";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useSelectedByte } from "@/util/selected-byte";
import { toast } from "sonner";

function Item({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono font-bold text-center p-1 bg-neutral-900 rounded">
      {children}
    </span>
  );
}

function Byte({
  value,
  isSelected,
  onClick,
}: {
  value: number;
  isSelected?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}) {
  return (
    <span
      className={`font-mono font-bold text-center p-1 rounded cursor-pointer
        ${isSelected ? "bg-blue-900" : "bg-neutral-900"}`}
      onClick={onClick}
    >
      {value.toString(16).padStart(2, "0")}
    </span>
  );
}

function AsciiChar({ value }: { value: number }) {
  // Show printable ASCII characters (including space) and replace others with a dot
  const char = value >= 32 && value <= 126 ? String.fromCharCode(value) : ".";
  return (
    <span className="font-mono w-[1ch] inline-block text-center">{char}</span>
  );
}

function MemoryGrid({
  block,
  onScrollToAddress,
  onByteSelect,
}: {
  block: MemoryBlock;
  onScrollToAddress: (scrollFn: (address: number) => void) => void;
  onByteSelect: () => void;
}) {
  const { setByte } = useProcessor();
  const [partialByte, setPartialByte] = useState<string>("");
  const listRef = useRef<List | null>(null);
  const data = block.values();
  const memoryType = block.cell_type();
  const { selectedByte, setSelectedByte } = useSelectedByte();
  const gridRef = useRef<HTMLDivElement>(null);

  // Expose scroll function to parent
  useEffect(() => {
    if (!listRef.current) return;
    onScrollToAddress((address: number) => {
      const rowIndex = Math.floor(address / 8);
      listRef.current?.scrollToItem(rowIndex, "center");
    });
  }, [onScrollToAddress]);

  // Add global click handler that only clears if clicking outside the grid and registers
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Don't clear if clicking inside grid or on a register
      if (
        gridRef.current?.contains(target) ||
        target.closest('[role="button"]')
      ) {
        return;
      }
      setSelectedByte(null);
      setPartialByte("");
    };

    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, [setSelectedByte]);

  useEffect(() => {
    if (selectedByte === null) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      const hex = /^[0-9a-fA-F]$/;
      if (!hex.test(e.key)) return;

      const newPartial = partialByte + e.key.toLowerCase();

      if (newPartial.length === 2) {
        const value = parseInt(newPartial, 16);
        setByte?.(memoryType, selectedByte, value);
        setPartialByte("");
        // Select next byte
        onByteSelect(); // Mark next selection as from grid
        setSelectedByte(
          selectedByte < data.length - 1 ? selectedByte + 1 : null
        );
      } else {
        setPartialByte(newPartial);
      }
    };

    window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, [
    selectedByte,
    partialByte,
    setByte,
    data.length,
    memoryType,
    setSelectedByte,
    onByteSelect,
  ]);

  return (
    <div ref={gridRef}>
      <List
        ref={listRef}
        height={Math.min(Math.ceil(data.length / 8) * 35, 400)}
        itemCount={Math.ceil(data.length / 8)}
        itemSize={35}
        width="100%"
      >
        {({ index, style }) => {
          const rowAddress = index * 8;
          const address = "0x" + rowAddress.toString(16).padStart(4, "0");
          const rowData = data.slice(rowAddress, rowAddress + 8);

          return (
            <div
              className="flex flex-row justify-between items-center px-4 gap-4"
              style={style}
              onClick={(e) => e.stopPropagation()}
            >
              <Item>{address}</Item>
              <div className="flex flex-row gap-2">
                {Array.from(rowData).map((value, i) => {
                  const byteAddress = rowAddress + i;
                  return (
                    <Byte
                      key={i}
                      value={
                        selectedByte === byteAddress && partialByte
                          ? parseInt(partialByte + "0", 16)
                          : value
                      }
                      isSelected={selectedByte === byteAddress}
                      onClick={(e) => {
                        e.stopPropagation();
                        onByteSelect();
                        setSelectedByte(byteAddress);
                        setPartialByte("");
                      }}
                    />
                  );
                })}
              </div>
              <div className="flex flex-row font-mono bg-neutral-900 p-2 rounded">
                {Array.from(rowData).map((value, i) => (
                  <AsciiChar key={i} value={value} />
                ))}
              </div>
            </div>
          );
        }}
      </List>
    </div>
  );
}

function MemoryView({ block }: { block: MemoryBlock }) {
  const { selectedByte } = useSelectedByte();
  const [scrollToAddress, setScrollToAddress] = useState<
    ((address: number) => void) | null
  >(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  const lastSelectionFromGrid = useRef(false);
  const lastWarningRef = useRef(0);

  // Handle scroll function from grid
  const handleScrollToAddress = useCallback(
    (scrollFn: (address: number) => void) => {
      setScrollToAddress(() => scrollFn);
    },
    []
  );

  // Scroll to selected byte only when shouldScroll is true
  useEffect(() => {
    if (selectedByte === null || !scrollToAddress || !shouldScroll) return;
    scrollToAddress(selectedByte);
    setShouldScroll(false);

    // Show warning toast for Harvard architecture if multiple memory blocks exist
    const now = Date.now();
    if (now - lastWarningRef.current >= 15000) {
      // 15 seconds debounce
      const memoryBlocks = document.querySelectorAll('[role="tabpanel"]');
      if (memoryBlocks.length > 1) {
        toast.warning("Multiple memory blocks detected", {
          description:
            "This is a Harvard architecture - make sure you're viewing the correct memory block for your address.",
        });
        lastWarningRef.current = now;
      }
    }
  }, [selectedByte, scrollToAddress, shouldScroll]);

  // Update shouldScroll when selectedByte changes from outside (e.g. register click)
  useEffect(() => {
    if (selectedByte === null) return;

    if (!lastSelectionFromGrid.current) {
      setShouldScroll(true);
    }
    // Reset the flag after checking it
    lastSelectionFromGrid.current = false;
  }, [selectedByte]);

  return (
    <MemoryGrid
      block={block}
      onScrollToAddress={handleScrollToAddress}
      onByteSelect={() => {
        lastSelectionFromGrid.current = true;
      }}
    />
  );
}

export default function Memory() {
  const { memory } = useProcessor();
  const [gotoValue, setGotoValue] = useState<string>("");
  const { setSelectedByte } = useSelectedByte();

  if (!memory || memory.length === 0) {
    return (
      <>
        <CardHeader>
          <CardTitle>Memory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-center">
            No memory available
          </div>
        </CardContent>
      </>
    );
  }

  const handleGoto = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;

    const value = gotoValue.toLowerCase().replace(/^0x/, "");
    const address = parseInt(value, 16);

    if (isNaN(address) || address < 0) {
      setGotoValue("");
      return;
    }

    setSelectedByte(address);
    setGotoValue("");
  };

  return (
    <>
      <CardHeader className="w-full flex flex-row justify-between items-center">
        <CardTitle>Memory</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Goto:</span>
          <input
            type="text"
            value={gotoValue}
            onChange={(e) => setGotoValue(e.target.value)}
            onKeyDown={handleGoto}
            className="w-24 px-2 py-1 text-sm font-mono bg-neutral-900 rounded border border-input focus:border-ring focus:outline-none"
            placeholder="0x0000"
          />
        </div>
      </CardHeader>
      <CardContent>
        {memory.length === 1 ? (
          <MemoryView block={memory[0]} />
        ) : (
          <Tabs defaultValue={memory[0].cell_type_name()} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              {memory.map((block) => (
                <TabsTrigger
                  key={block.cell_type_name()}
                  value={block.cell_type_name()}
                >
                  {block.cell_type_name()}
                </TabsTrigger>
              ))}
            </TabsList>
            {memory.map((block) => (
              <TabsContent
                key={block.cell_type_name()}
                value={block.cell_type_name()}
              >
                <MemoryView block={block} />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </>
  );
}
