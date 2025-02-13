import { InstructionSchema, type Instruction } from "@/lib/schemas/instruction";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";

// Mark as server-side only
export const dynamic = 'force-static';

function loadInstructions(architecture: string): Record<string, Instruction> {
  const instructionsPath = join(process.cwd(), "data", "instructions", architecture);
  
  try {
    const files = readdirSync(instructionsPath);
    return Object.fromEntries(
      files
        .filter(file => file.endsWith(".json"))
        .map(file => {
          const content = readFileSync(join(instructionsPath, file), "utf-8");
          const data = JSON.parse(content);
          const name = file.replace(".json", "");
          return [name, InstructionSchema.parse(data)];
        })
    );
  } catch (error) {
    console.error(`Error loading instructions for ${architecture}:`, error);
    return {};
  }
}

// Cache the instructions at module level
const instructionsCache: Record<string, Record<string, Instruction>> = {
  stack: loadInstructions("stack"),
};

export function getInstructionsByArchitecture(architecture: string): Instruction[] {
  return Object.values(instructionsCache[architecture] || {});
}

export function getInstruction(architecture: string, name: string): Instruction | null {
  return instructionsCache[architecture]?.[name] || null;
} 