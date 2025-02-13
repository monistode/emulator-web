import * as React from "react";
import { Card } from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronUp, ChevronDown } from "lucide-react";

interface DetailItem {
  label: string;
  description: string;
}

function HoverableDescription({ label, description }: DetailItem) {
  return (
    <HoverCard openDelay={0} closeDelay={0}>
      <HoverCardTrigger className="cursor-pointer">
        <span className="border-b border-dotted border-muted-foreground/50 whitespace-nowrap">
          {label}
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="text-sm max-w-[320px] whitespace-normal break-words">
        {description}
      </HoverCardContent>
    </HoverCard>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-lg font-semibold border-b border-neutral-800 pb-2">
      {children}
    </h3>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Section({ title, children, className }: SectionProps) {
  return (
    <div className={`space-y-4 ${className || ""}`}>
      <SectionHeader>{title}</SectionHeader>
      {children}
    </div>
  );
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-neutral-800 px-1.5 py-0.5 text-sm font-mono">
      {children}
    </code>
  );
}

interface MemoryTypeProps {
  type: string;
  width: string;
  space: string;
  description: string;
}

export function MemorySection({ type, width, space, description }: MemoryTypeProps) {
  return (
    <TableRow>
      <TableCell className="whitespace-nowrap">
        <HoverableDescription label={type} description={description} />
      </TableCell>
      <TableCell className="whitespace-nowrap"><CodeBlock>{width}</CodeBlock></TableCell>
      <TableCell className="whitespace-nowrap"><CodeBlock>{space}</CodeBlock></TableCell>
    </TableRow>
  );
}

export function AdditionalInfo({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  
  const items = React.Children.toArray(children)
    .map(child => child?.toString())
    .filter(Boolean);
  
  return (
    <ul className="space-y-1 text-sm text-muted-foreground">
      {items.map((info, index) => (
        <li key={index}>• {info}</li>
      ))}
    </ul>
  );
}

export function MemoryModelSection({ children }: { children: React.ReactNode }) {
  const memoryChildren = React.Children.toArray(children).filter(
    child => React.isValidElement(child) && child.type === MemorySection
  );
  const additionalInfo = React.Children.toArray(children).find(
    child => React.isValidElement(child) && child.type === AdditionalInfo
  );

  return (
    <Section title="MEMORY MODEL">
      <div className="min-w-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Type</TableHead>
              <TableHead className="w-[30%]">Width</TableHead>
              <TableHead className="w-[40%]">Space</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {memoryChildren}
          </TableBody>
        </Table>
      </div>
      {additionalInfo}
    </Section>
  );
}

interface RegisterProps {
  name: string;
  fullname: string;
  width: number;
  description: string;
}

export function Register({ name, fullname, width, description }: RegisterProps) {
  return (
    <TableRow>
      <TableCell className="font-mono whitespace-nowrap">
        <HoverableDescription label={name} description={description} />
      </TableCell>
      <TableCell className="text-sm whitespace-nowrap"><CodeBlock>{width}-bit</CodeBlock></TableCell>
      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{fullname}</TableCell>
    </TableRow>
  );
}

export function SystemRegisters({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-sm font-medium mb-2">System Registers:</h4>
      <div className="min-w-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Name</TableHead>
              <TableHead className="w-[30%]">Size</TableHead>
              <TableHead className="w-[40%]">Full Name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {children}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

interface StackProps {
  name: string;
  direction: "up" | "down";
  description: string;
}

export function Stack({ name, direction, description }: StackProps) {
  return (
    <TableRow>
      <TableCell className="font-mono whitespace-nowrap">
        <HoverableDescription 
          label={`${name} ${direction === "up" ? "↑" : "↓"}`} 
          description={description}
        />
      </TableCell>
      <TableCell className="whitespace-nowrap">
        {direction === "up" ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{name}</TableCell>
    </TableRow>
  );
}

export function StacksSection({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-sm font-medium mb-2">Stacks:</h4>
      <div className="min-w-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Name</TableHead>
              <TableHead className="w-[20%]">Direction</TableHead>
              <TableHead className="w-[40%]">Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {children}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function RegistersSection({ children }: { children: React.ReactNode }) {
  const systemRegisters = React.Children.toArray(children).find(
    child => React.isValidElement(child) && child.type === SystemRegisters
  );
  const stacks = React.Children.toArray(children).find(
    child => React.isValidElement(child) && child.type === StacksSection
  );

  return (
    <Section title="REGISTERS">
      <div className="space-y-6">
        {systemRegisters}
        {stacks}
      </div>
    </Section>
  );
}

export function AddressingMode({ label, description }: DetailItem) {
  return (
    <li>
      <HoverableDescription label={label} description={description} />
    </li>
  );
}

export function AddressingModesSection({ children }: { children: React.ReactNode }) {
  return (
    <Section title="ADDRESSING MODES">
      <ul className="space-y-1">
        {children}
      </ul>
    </Section>
  );
}

export function InstructionFormatItem({ label, description }: DetailItem) {
  return (
    <div>
      <HoverableDescription label={label} description={description} />
    </div>
  );
}

export function InstructionFormatSection({ children }: { children: React.ReactNode }) {
  return (
    <Section title="INSTRUCTION FORMAT" className="lg:col-span-2">
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          {children}
        </div>
      </div>
    </Section>
  );
}

export function IOModelItem({ label, description }: DetailItem) {
  return (
    <li>
      <HoverableDescription label={label} description={description} />
    </li>
  );
}

export function IOModelSection({ children }: { children: React.ReactNode }) {
  return (
    <Section title="I/O MODEL">
      <ul className="space-y-1">
        {children}
      </ul>
    </Section>
  );
}

export function ArchitectureCard({ children }: { children: React.ReactNode }) {
  return (
    <Card className="w-full bg-neutral-900 border-neutral-800">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-6">
        {children}
      </div>
    </Card>
  );
}

export function ArchitectureTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="lg:col-span-3 border-b border-neutral-800 pb-4">
      <h2 className="text-2xl font-mono tracking-wider">{children}</h2>
    </div>
  );
}

export type { DetailItem, RegisterProps, StackProps, MemoryTypeProps };