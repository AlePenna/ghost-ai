"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { brandButton } from "@/components/editor/editor-styles";

interface EditorHomeProps {
  onNewProject: () => void;
}

export function EditorHome({ onNewProject }: EditorHomeProps) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold text-foreground">
        Create a project or open an existing one
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Start a new architecture workspace, or choose a project from the
        sidebar.
      </p>
      <Button
        className={brandButton}
        onClick={onNewProject}
      >
        <Plus className="h-4 w-4" />
        New Project
      </Button>
    </main>
  );
}
