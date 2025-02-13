"use client";

import { Card } from "@/components/ui/card";
import { InteractiveCode } from "@/components/ui/interactive-code";
import { ProcessorType } from "monistode-emulator-bindings";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { createContext, useContext } from "react";

interface InstructionContextType {
  totalBytes: number;
}

const InstructionContext = createContext<InstructionContextType>({ totalBytes: 0 });

// Field Components
interface FieldProps {
  children: string;
  bits: number;
  name?: string;
  isPadding?: boolean;
}

export function Opcode({ children, bits, name = "opcode" }: FieldProps) {
  return <InstructionField bits={bits} name={name}>{children}</InstructionField>;
}

export function Padding({ bits }: { bits: number }) {
  return <InstructionField bits={bits} name="padding" isPadding>{`0`.repeat(bits)}</InstructionField>;
}

export function InstructionField({ children, bits, name = "field", isPadding = false }: FieldProps) {
  const { totalBytes } = useContext(InstructionContext);
  const percentage = (bits / (totalBytes * 8)) * 100;

  return (
    <div 
      className={`text-center flex-1 px-1 ${isPadding ? 'text-neutral-600' : ''}`}
      style={{ flexBasis: `${percentage}%` }}
    >
      <div className="text-sm text-neutral-400 truncate">{name}</div>
      <div className="text-xs text-neutral-500">{bits} bits</div>
      <div 
        className={`flex items-center justify-center border rounded mx-0.5 first:ml-0 last:mr-0 h-12 mt-2 ${
          isPadding 
            ? 'border-neutral-700 bg-neutral-800 text-neutral-600' 
            : 'border-neutral-600 bg-neutral-800'
        }`}
      >
        <span className="font-mono text-sm whitespace-nowrap overflow-hidden text-ellipsis px-2">
          {children}
        </span>
      </div>
    </div>
  );
}

// Description Component
export function InstructionDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-lg text-neutral-400">{children}</p>;
}

// Fields Container Component
interface InstructionFieldsProps {
  bytes: number;
  children: React.ReactNode;
}

export function InstructionFields({ bytes, children }: InstructionFieldsProps) {
  return (
    <InstructionContext.Provider value={{ totalBytes: bytes }}>
      <div className="mt-6 space-y-2 max-w-4xl mx-auto">
        <div className="flex w-full">
          {children}
        </div>
        <div className="relative pt-4">
          <div className="absolute left-0 right-0 top-0 border-t border-green-500" />
          <div className="absolute left-1/2 -translate-x-1/2 -top-3">
            <span className="text-sm text-green-400 bg-neutral-900 px-2">{bytes} bytes</span>
          </div>
        </div>
      </div>
    </InstructionContext.Provider>
  );
}

// Details Components
interface DetailItemProps {
  name: string;
  description: string;
}

interface DetailGroupProps {
  title: string;
  children: React.ReactNode;
}

export function DetailGroup({ title, children }: DetailGroupProps) {
  return (
    <div>
      <h4 className="font-semibold mb-2">{title}</h4>
      <ul className="space-y-2">
        {children}
      </ul>
    </div>
  );
}

export function DetailItem({ name, description }: DetailItemProps) {
  return (
    <li className="flex flex-col">
      <span className="font-mono text-sm">{name}</span>
      <span className="text-sm text-neutral-400">{description}</span>
    </li>
  );
}

export function DetailNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-sm text-neutral-400 italic">
      {children}
    </div>
  );
}

interface InstructionDetailsProps {
  children: React.ReactNode;
}

export function InstructionDetails({ children }: InstructionDetailsProps) {
  return (
    <Accordion type="single" collapsible className="w-full mt-6">
      <AccordionItem value="details">
        <AccordionTrigger>Operation Effects</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-6 max-w-3xl">
            {children}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

// Example Component
export function InstructionExample({ code, architecture = ProcessorType.Stack }: { code: string, architecture?: ProcessorType }) {
  if (!code) return null;
  
  return (
    <div className="mt-6">
      <InteractiveCode initialCode={code} architecture={architecture} />
    </div>
  );
}

// Main Card Component
interface InstructionCardProps {
  name: string;
  children: React.ReactNode;
}

export function InstructionCard({ name, children }: InstructionCardProps) {
  return (
    <Card className="p-6 bg-neutral-900 w-full">
      <h3 className="text-3xl font-mono tracking-wider mb-2">{name}</h3>
      {children}
    </Card>
  );
} 