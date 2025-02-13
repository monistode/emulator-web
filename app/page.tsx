import { Card } from "@/components/ui/card";
import Memory from "@/components/memory";
import { Controls } from "@/components/controls";
import { Output } from "@/components/output";
import { Registers } from "@/components/registers";
import { Stack } from "@/components/stack";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col gap-4 w-full max-w-6xl">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          This is a work in progress. Currently, only the Stack architecture is
          fully supported, and RISC is partially supported. Other architectures
          are not yet implemented.
        </AlertDescription>
      </Alert>

      <Card className="p-6">
        <Controls />
      </Card>
      <div className="flex flex-row flex-wrap-reverse justify-stretch items-stretch gap-4 w-full">
        <Card className="flex-1 min-w-[500px]">
          <Memory />
        </Card>
        <div className="flex flex-col flex-1 gap-4 min-h-0 min-w-80">
          <Card>
            <Registers />
          </Card>
          <Card className="flex-1">
            <Stack />
          </Card>
        </div>
      </div>
      <Output />
    </div>
  );
}
