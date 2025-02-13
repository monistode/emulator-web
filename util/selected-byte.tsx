"use client";

import { createContext, useContext, useState } from "react";

type SelectedByteContext = {
  selectedByte: number | null;
  setSelectedByte: (byte: number | null) => void;
};

const SelectedByteContext = createContext<SelectedByteContext>({
  selectedByte: null,
  setSelectedByte: () => {},
});

export function SelectedByteProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedByte, setSelectedByte] = useState<number | null>(null);

  return (
    <SelectedByteContext.Provider value={{ selectedByte, setSelectedByte }}>
      {children}
    </SelectedByteContext.Provider>
  );
}

export const useSelectedByte = () => useContext(SelectedByteContext);

