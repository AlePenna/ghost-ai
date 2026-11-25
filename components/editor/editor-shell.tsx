"use client";

import { useState, type ReactNode } from "react";

import { EditorHome } from "@/components/editor/editor-home";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { useProjectActions } from "@/hooks/use-project-actions";
import type { Project } from "@/lib/projects";

interface EditorShellProps {
  ownedProjects: Project[];
  sharedProjects: Project[];
  /** Main content; defaults to the editor home prompt. */
  children?: ReactNode;
}

export function EditorShell({
  ownedProjects,
  sharedProjects,
  children,
}: EditorShellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const actions = useProjectActions();

  return (
    <div className="flex h-screen flex-col">
      <EditorNavbar
        isSidebarOpen={isOpen}
        onToggleSidebar={() => setIsOpen((o) => !o)}
      />
      <ProjectSidebar
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        ownedProjects={ownedProjects}
        sharedProjects={sharedProjects}
        onNewProject={actions.openCreate}
        onRenameProject={actions.openRename}
        onDeleteProject={actions.openDelete}
      />
      {children ?? <EditorHome onNewProject={actions.openCreate} />}
      <ProjectDialogs {...actions} />
    </div>
  );
}
