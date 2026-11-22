"use client";

import { FolderOpen, Plus, Users, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  onNewProject?: () => void;
}

interface EmptyStateProps {
  icon: LucideIcon;
  message: string;
}

function EmptyState({ icon: Icon, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
      <Icon className="h-8 w-8" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function ProjectSidebar({
  isOpen,
  onClose,
  onNewProject,
}: ProjectSidebarProps) {
  return (
    <aside
      aria-hidden={!isOpen}
      inert={!isOpen}
      className={cn(
        "fixed top-14 bottom-0 left-0 z-30 flex w-80 flex-col border-r border-border bg-background/90 backdrop-blur-md transition-transform duration-200 ease-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
        <h2 className="text-sm font-medium text-foreground">Projects</h2>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="my-projects" className="min-h-0 flex-1 gap-0 p-4">
        <TabsList className="w-full">
          <TabsTrigger value="my-projects">My Projects</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
        </TabsList>
        <TabsContent value="my-projects" className="overflow-y-auto">
          <EmptyState icon={FolderOpen} message="No projects yet" />
        </TabsContent>
        <TabsContent value="shared" className="overflow-y-auto">
          <EmptyState icon={Users} message="No shared projects yet" />
        </TabsContent>
      </Tabs>

      <div className="shrink-0 border-t border-border p-4">
        <Button className="w-full" onClick={onNewProject}>
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>
    </aside>
  );
}
