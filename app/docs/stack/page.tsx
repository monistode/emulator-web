import {
  InstructionCard,
  InstructionDescription,
  InstructionFields,
  Opcode,
  InstructionField,
  Padding,
  InstructionDetails,
  DetailGroup,
  DetailItem as InstructionDetailItem,
  DetailNote,
  InstructionExample,
} from "@/components/ui/command-card";
import {
  ArchitectureCard,
  ArchitectureTitle,
  MemoryModelSection,
  RegistersSection,
  AddressingModesSection,
  InstructionFormatSection,
  IOModelSection,
  Register,
  MemorySection,
  AdditionalInfo,
  Stack,
  SystemRegisters,
  StacksSection,
  AddressingMode,
  InstructionFormatItem,
  IOModelItem,
} from "@/components/ui/architecture-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getInstructionsByArchitecture } from "@/lib/utils/instructions";
import { type Instruction } from "@/lib/schemas/instruction";

function InstructionSection({ instruction }: { instruction: Instruction }) {
  return (
    <InstructionCard name={instruction.name}>
      <InstructionDescription>
        {instruction.description}
      </InstructionDescription>

      <InstructionFields bytes={instruction.format.bytes}>
        {instruction.format.fields.map((field, index) => {
          if (field.type === "opcode") {
            return <Opcode key={index} bits={field.bits}>{field.value || ""}</Opcode>;
          }
          if (field.type === "padding") {
            return <Padding key={index} bits={field.bits} />;
          }
          return (
            <InstructionField
              key={index}
              bits={field.bits}
              name={field.name}
            >
              {field.value || ""}
            </InstructionField>
          );
        })}
      </InstructionFields>

      <InstructionDetails>
        {instruction.effects.inputs && (
          <DetailGroup title="Inputs">
            {instruction.effects.inputs.map((effect, index) => (
              <InstructionDetailItem
                key={index}
                name={effect.name}
                description={effect.description}
              />
            ))}
          </DetailGroup>
        )}

        {instruction.effects.outputs && (
          <DetailGroup title="Outputs">
            {instruction.effects.outputs.map((effect, index) => (
              <InstructionDetailItem
                key={index}
                name={effect.name}
                description={effect.description}
              />
            ))}
          </DetailGroup>
        )}

        {instruction.effects.flags && (
          <DetailGroup title="Flags">
            {instruction.effects.flags.map((effect, index) => (
              <InstructionDetailItem
                key={index}
                name={effect.name}
                description={effect.description}
              />
            ))}
          </DetailGroup>
        )}

        {instruction.effects.notes?.map((note, index) => (
          <DetailNote key={index}>{note}</DetailNote>
        ))}
      </InstructionDetails>

      {instruction.example && (
        <InstructionExample code={instruction.example.code} />
      )}
    </InstructionCard>
  );
}

export default function StackDocs() {
  const instructions = getInstructionsByArchitecture("stack");

  return (
    <div className="container flex flex-col gap-8">
      <Alert>
        <AlertDescription className="text-muted-foreground italic">
          Documentation is under construction. More content will be available soon! 🚧
        </AlertDescription>
      </Alert>

      <ArchitectureCard>
        <ArchitectureTitle>STACK ARCHITECTURE</ArchitectureTitle>
        <MemoryModelSection>
          <MemorySection
            type="Program"
            width="6-bit"
            space="16-bit"
            description="Stores program instructions in Harvard architecture"
          />
          <MemorySection
            type="Data"
            width="8-bit"
            space="16-bit"
            description="Stores data values and stack contents"
          />
          <AdditionalInfo>Harvard Architecture</AdditionalInfo>
        </MemoryModelSection>
        <RegistersSection>
          <SystemRegisters>
            <Register
              name="PC"
              fullname="Program Counter"
              width={16}
              description="Points to the next instruction to be executed, similar to x86."
            />
            <Register
              name="FR"
              fullname="Flags Register"
              width={16}
              description="Contains status flags: CF (Carry), ZF (Zero), OF (Overflow), SF (Sign). Used to track the results of arithmetic and logical operations."
            />
            <Register
              name="TOS"
              fullname="Top of Stack"
              width={16}
              description="Points to the top of the register stack. Initial value is 256. Grows upward (increments on push)."
            />
            <Register
              name="SP"
              fullname="Stack Pointer"
              width={16}
              description="Points to the top of the memory stack. Initial value is 1024. Grows downward (decrements on push)."
            />
          </SystemRegisters>
          <StacksSection>
            <Stack
              name="Register Stack"
              direction="up"
              description="Main operand stack for arithmetic and logic operations. Stores 16-bit values. Grows upward from address 256. Used for most instruction operands."
            />
            <Stack
              name="Memory Stack"
              direction="down"
              description="Used for function return addresses and local variables. Stores 16-bit values. Grows downward from address 1024. Stack underflow and collisions with register stack are not handled."
            />
          </StacksSection>
        </RegistersSection>
        <AddressingModesSection>
          <AddressingMode
            label="Register"
            description="Operands are implicitly accessed from the register stack. Most operations pop their operands and push results."
          />
          <AddressingMode
            label="Immediate"
            description="Value is encoded in the instruction as a 16-bit immediate following the opcode. Used for constants and addresses."
          />
          <AddressingMode
            label="Memory Location"
            description="Value is loaded from or stored to memory at an address. The address is either immediate or popped from the register stack."
          />
        </AddressingModesSection>
        <InstructionFormatSection>
          <InstructionFormatItem
            label="6-bit base instruction"
            description="First bit indicates presence of immediate value (0: no immediate, 1: has immediate). Remaining 5 bits encode the operation (37 possible instructions)."
          />
          <InstructionFormatItem
            label="Optional 16-bit immediate follows"
            description="Present when the immediate flag is set. Contains either a constant value or memory address depending on the instruction."
          />
        </InstructionFormatSection>
        <IOModelSection>
          <IOModelItem
            label="Multiple serial ports"
            description="Each port can be used for input or output operations. Ports are addressed by a 16-bit port number."
          />
          <IOModelItem
            label="16-bit port address space"
            description="Allows addressing up to 65536 different I/O ports. Each port can transfer 16-bit values."
          />
          <IOModelItem
            label="Simple IN/OUT operations"
            description="IN instruction reads from a port and pushes the value to the register stack. OUT instruction pops a value from the register stack and writes it to a port."
          />
        </IOModelSection>
      </ArchitectureCard>

      {instructions.map((instruction, index) => (
        <InstructionSection key={index} instruction={instruction} />
      ))}
    </div>
  );
} 