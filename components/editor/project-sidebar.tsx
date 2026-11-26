"use client";

import { FolderOpen, Pencil, Plus, Trash2, Users, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Project } from "@/lib/projects";
import { cn } from "@/lib/utils";
import { brandButton, brandGhostButton } from "@/components/editor/editor-styles";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  currentProjectId?: string;
  /** Float over the workspace canvas (absolute) instead of a viewport overlay. */
  docked?: boolean;
  onNewProject?: () => void;
  ownedProjects: Project[];
  sharedProjects: Project[];
  onRenameProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
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

interface ProjectListProps {
  projects: Project[];
  currentProjectId?: string;
  onRename: (project: Project) => void;
  onDelete: (project: Project) => void;
}

function ProjectList({
  projects,
  currentProjectId,
  onRename,
  onDelete,
}: ProjectListProps) {
  return (
    <ul className="flex flex-col gap-1">
      {projects.map((project) => (
        <li
          key={project.id}
          className={cn(
            "group flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-muted/60",
            project.id === currentProjectId &&
              "border border-brand/30 bg-brand/10 font-medium",
          )}
        >
          <Link
            href={`/editor/${project.id}`}
            aria-current={project.id === currentProjectId ? "page" : undefined}
            className="flex min-w-0 flex-1 items-center gap-3"
          >
            <span
              aria-hidden="true"
              className={cn(
                "h-1.5 w-1.5 shrink-0 rounded-full",
                project.id === currentProjectId
                  ? "bg-brand"
                  : "bg-muted-foreground/50",
              )}
            />
            <span className="truncate">{project.name}</span>
          </Link>
          {project.isOwner ? (
            <span className="flex shrink-0 items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                className={brandGhostButton}
                onClick={() => onRename(project)}
                aria-label={`Rename ${project.name}`}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className={brandGhostButton}
                onClick={() => onDelete(project)}
                aria-label={`Delete ${project.name}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function ProjectSidebar({
  isOpen,
  onClose,
  currentProjectId,
  docked = false,
  onNewProject,
  ownedProjects,
  sharedProjects,
  onRenameProject,
  onDeleteProject,
}: ProjectSidebarProps) {
  return (
    <>
      {/* Mobile backdrop scrim: tap outside the sidebar to close it. */}
      {docked ? null : (
        <div
          aria-hidden="true"
          onClick={onClose}
          className={cn(
            "fixed inset-x-0 top-14 bottom-0 z-20 bg-black/50 transition-opacity duration-200 md:hidden",
            isOpen ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        />
      )}
      <aside
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={cn(
          "z-30 flex w-80 flex-col rounded-2xl border border-border bg-background/90 shadow-2xl backdrop-blur-md",
          docked ? "absolute top-3 bottom-3 left-3" : "fixed top-16 bottom-2 left-2",
          // Slide past the left inset and the shadow, then go `invisible` once
          // the transition ends so nothing peeks in from the edge.
          "transition-[translate,visibility] duration-200 ease-out",
          isOpen ? "translate-x-0" : "invisible -translate-x-[calc(100%+2rem)]",
        )}
      >
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
          <h2 className="text-sm font-medium text-foreground">Projects</h2>
          <Button
            variant="ghost"
            size="icon-sm"
            className={brandGhostButton}
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
            {ownedProjects.length > 0 ? (
              <ProjectList
                projects={ownedProjects}
                currentProjectId={currentProjectId}
                onRename={onRenameProject}
                onDelete={onDeleteProject}
              />
            ) : (
              <EmptyState icon={FolderOpen} message="No projects yet" />
            )}
          </TabsContent>
          <TabsContent value="shared" className="overflow-y-auto">
            {sharedProjects.length > 0 ? (
              <ProjectList
                projects={sharedProjects}
                currentProjectId={currentProjectId}
                onRename={onRenameProject}
                onDelete={onDeleteProject}
              />
            ) : (
              <EmptyState icon={Users} message="No shared projects yet" />
            )}
          </TabsContent>
        </Tabs>

        <div className="shrink-0 border-t border-border p-4">
          <Button
            className={cn("w-full", brandButton)}
            onClick={onNewProject}
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </aside>
    </>
  );
}
