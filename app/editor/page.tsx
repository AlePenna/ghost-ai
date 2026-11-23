"use client";

import { useState } from "react";

import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";

export default function EditorPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col">
      <EditorNavbar
        isSidebarOpen={isOpen}
        onToggleSidebar={() => setIsOpen((o) => !o)}
      />
      <ProjectSidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
