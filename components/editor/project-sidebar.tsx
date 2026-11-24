"use client";

import { FolderOpen, Pencil, Plus, Trash2, Users, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Project } from "@/lib/projects";
import { cn } from "@/lib/utils";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
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
  onRename: (project: Project) => void;
  onDelete: (project: Project) => void;
}

function ProjectList({ projects, onRename, onDelete }: ProjectListProps) {
  return (
    <ul className="flex flex-col gap-1">
      {projects.map((project) => (
        <li
          key={project.id}
          className="group flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-muted"
        >
          <span className="truncate">{project.name}</span>
          {project.isOwner ? (
            <span className="flex shrink-0 items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onRename(project)}
                aria-label={`Rename ${project.name}`}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
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
  onNewProject,
  ownedProjects,
  sharedProjects,
  onRenameProject,
  onDeleteProject,
}: ProjectSidebarProps) {
  return (
    <>
      {/* Mobile backdrop scrim: tap outside the sidebar to close it. */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          "fixed inset-x-0 top-14 bottom-0 z-20 bg-black/50 transition-opacity duration-200 md:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
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
            {ownedProjects.length > 0 ? (
              <ProjectList
                projects={ownedProjects}
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
                onRename={onRenameProject}
                onDelete={onDeleteProject}
              />
            ) : (
              <EmptyState icon={Users} message="No shared projects yet" />
            )}
          </TabsContent>
        </Tabs>

        <div className="shrink-0 border-t border-border p-4">
          <Button className="w-full" onClick={onNewProject}>
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </aside>
    </>
  );
}
