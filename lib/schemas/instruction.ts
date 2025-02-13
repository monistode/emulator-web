import { z } from "zod";

export const InstructionFieldSchema = z.object({
  type: z.enum(["opcode", "immediate", "padding"]),
  bits: z.number(),
  name: z.string().optional(),
  value: z.string().optional(),
});

export const EffectSchema = z.object({
  name: z.string(),
  description: z.string(),
});

export const InstructionSchema = z.object({
  name: z.string(),
  description: z.string(),
  format: z.object({
    bytes: z.number(),
    fields: z.array(InstructionFieldSchema),
  }),
  effects: z.object({
    inputs: z.array(EffectSchema).optional(),
    outputs: z.array(EffectSchema).optional(),
    flags: z.array(EffectSchema).optional(),
    notes: z.array(z.string()).optional(),
  }),
  example: z.object({
    code: z.string(),
    description: z.string().optional(),
  }).optional(),
});

export type Instruction = z.infer<typeof InstructionSchema>;
export type InstructionField = z.infer<typeof InstructionFieldSchema>;
export type Effect = z.infer<typeof EffectSchema>; 