"use client";

import { Bot, Sparkles } from "lucide-react";
import { useState, type ReactNode } from "react";

import { EditorHome } from "@/components/editor/editor-home";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { ShareDialog } from "@/components/editor/share-dialog";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { useProjectActions } from "@/hooks/use-project-actions";
import type { Project } from "@/lib/projects";

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
        <div className="relative flex min-h-0 flex-1 gap-3 p-3">
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
          {children}
          {isAiOpen ? (
            <aside className="hidden w-80 shrink-0 flex-col rounded-2xl border border-border bg-background md:flex">
              <div className="flex items-start justify-between border-b border-border px-5 py-4">
                <div>
                  <h2 className="text-sm font-medium text-foreground">
                    AI Copilot
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Placeholder panel
                  </p>
                </div>
                <Sparkles className="h-4 w-4 text-brand" />
              </div>
              <div className="m-4 flex gap-3 rounded-2xl border border-border p-4">
                <Bot className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                <div>
                  <h3 className="text-sm font-medium text-foreground">
                    Chat surface pending
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    The toggle is wired. Messaging and generation are
                    intentionally out of scope here.
                  </p>
                </div>
              </div>
              <div className="mx-4 mt-auto mb-4 rounded-2xl border border-dashed border-border p-4">
                <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                  Future hooks
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Prompt composer, run status, and architecture guidance will
                  attach to this sidebar.
                </p>
              </div>
            </aside>
          ) : null}
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
