"use client";

import Link from "next/link";
import {
  Cpu,
  Code,
  FileCode,
  Package,
  Layers,
  Boxes,
  Microchip,
  CircuitBoard,
  Terminal,
  MonitorPlay,
  Upload,
  Github,
} from "lucide-react";

import {
  Sidebar as SidebarRoot,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function Sidebar() {
  return (
    <SidebarRoot>
      <SidebarContent className="flex flex-col h-full">
        <div className="flex h-14 items-center justify-between border-b px-6">
          <Link
            href="https://github.com/monistode"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-sm font-medium ring-offset-background transition-colors hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Github className="mr-2 h-4 w-4" />
            View on GitHub
          </Link>
        </div>
        <div className="flex-1">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/">
                      <Cpu className="mr-2 h-4 w-4" />
                      <span>Emulator</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/assembler">
                      <Code className="mr-2 h-4 w-4" />
                      <span>Assembler</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel className="px-4">Tools</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/tools/binutils">
                      <Terminal className="mr-2 h-4 w-4" />
                      <span>CLI Binutils</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/tools/emulator">
                      <MonitorPlay className="mr-2 h-4 w-4" />
                      <span>CLI Emulator</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/tools/uploader">
                      <Upload className="mr-2 h-4 w-4" />
                      <span>Executable Uploader</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel className="px-4">Formats</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/explore/object">
                      <FileCode className="mr-2 h-4 w-4" />
                      <span>Object Explorer</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/explore/executable">
                      <Package className="mr-2 h-4 w-4" />
                      <span>Executable Explorer</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel className="px-4">
              Architectures
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/docs/stack">
                      <Boxes className="mr-2 h-4 w-4" />
                      <span>Stack</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/docs/accumulator">
                      <Layers className="mr-2 h-4 w-4" />
                      <span>Accumulator</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/docs/risc">
                      <Microchip className="mr-2 h-4 w-4" />
                      <span>RISC</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/docs/cisc">
                      <CircuitBoard className="mr-2 h-4 w-4" />
                      <span>CISC</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </SidebarRoot>
  );
}
