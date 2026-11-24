"use client";

import { useState } from "react";

import { EditorHome } from "@/components/editor/editor-home";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { useProjectDialogs } from "@/hooks/use-project-dialogs";

export default function EditorPage() {
  const [isOpen, setIsOpen] = useState(false);
  const projects = useProjectDialogs();

  return (
    <div className="flex h-screen flex-col">
      <EditorNavbar
        isSidebarOpen={isOpen}
        onToggleSidebar={() => setIsOpen((o) => !o)}
      />
      <ProjectSidebar
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        ownedProjects={projects.ownedProjects}
        sharedProjects={projects.sharedProjects}
        onNewProject={projects.openCreate}
        onRenameProject={projects.openRename}
        onDeleteProject={projects.openDelete}
      />
      <EditorHome onNewProject={projects.openCreate} />
      <ProjectDialogs {...projects} />
    </div>
  );
}
