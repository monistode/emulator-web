"use client";

import { InteractiveCode } from "@/components/ui/interactive-code";
import { ProcessorType } from "monistode-emulator-bindings";

const helloWorldExample = `.text
_start:
    mov 'H'
    out 0
    mov 'e'
    out 0
    mov 'l'
    out 0
    mov 'l'
    out 0
    mov 'o'
    out 0
    mov ','
    out 0
    mov ' '
    out 0
    mov 'W'
    out 0
    mov 'o'
    out 0
    mov 'r'
    out 0
    mov 'l'
    out 0
    mov 'd'
    out 0
    mov '!'
    out 0
    halt`;

export default function StackDocs() {
  return (
    <div className="prose prose-invert max-w-4xl mx-auto">
      <h1>Stack Architecture</h1>
      <p className="text-muted-foreground italic">
        Documentation is under construction. More content will be available soon! 🚧
      </p>
      <InteractiveCode initialCode={helloWorldExample} architecture={ProcessorType.Stack} />
    </div>
  );
} 