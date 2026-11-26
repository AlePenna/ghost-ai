"use client";

import { useState, type ReactNode } from "react";

import { AiSidebar } from "@/components/editor/ai-sidebar";
import { EditorHome } from "@/components/editor/editor-home";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { ShareDialog } from "@/components/editor/share-dialog";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { useProjectActions } from "@/hooks/use-project-actions";
import type { Project } from "@/lib/projects";
import { cn } from "@/lib/utils";

interface EditorShellProps {
  ownedProjects: Project[];
  sharedProjects: Project[];
  /** Main content; defaults to the editor home prompt. */
  children?: ReactNode;
  /** Set on a project workspace: highlights it and shows workspace actions. */
  workspace?: { id: string; name: string };
}

export function EditorShell({
  ownedProjects,
  sharedProjects,
  children,
  workspace,
}: EditorShellProps) {
  const [isOpen, setIsOpen] = useState(Boolean(workspace));
  const [isAiOpen, setIsAiOpen] = useState(true);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const actions = useProjectActions();

  return (
    <div className="flex h-screen flex-col">
      <EditorNavbar
        isSidebarOpen={isOpen}
        onToggleSidebar={() => setIsOpen((o) => !o)}
        projectName={workspace?.name}
        isAiSidebarOpen={isAiOpen}
        onToggleAiSidebar={workspace ? () => setIsAiOpen((o) => !o) : undefined}
        onShare={() => setIsShareOpen(true)}
      />
      {workspace ? (
        // Full-bleed canvas; both sidebars float over it (absolute, z-30) so
        // the dotted background runs edge-to-edge underneath them.
        <div
          className={cn(
            "relative min-h-0 flex-1 overflow-hidden bg-base",
            // Lets canvas chrome (MiniMap) clear the open AI panel on desktop.
            isAiOpen && "md:[--canvas-inset-right:21.5rem]",
          )}
        >
          {children}
          <ProjectSidebar
            isOpen={isOpen}
            docked
            onClose={() => setIsOpen(false)}
            currentProjectId={workspace?.id}
            ownedProjects={ownedProjects}
            sharedProjects={sharedProjects}
            onNewProject={actions.openCreate}
            onRenameProject={actions.openRename}
            onDeleteProject={actions.openDelete}
          />
          <AiSidebar isOpen={isAiOpen} />
        </div>
      ) : (
        <>
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
        </>
      )}
      {workspace ? (
        <ShareDialog
          open={isShareOpen}
          onOpenChange={setIsShareOpen}
          projectId={workspace.id}
        />
      ) : null}
      <ProjectDialogs {...actions} />
    </div>
  );
}
