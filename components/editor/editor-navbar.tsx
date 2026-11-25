"use client";

import { UserButton } from "@clerk/nextjs";
import { PanelLeftClose, PanelLeftOpen, Share2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { brandButton, brandGhostButton } from "@/components/editor/editor-styles";

interface EditorNavbarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  /** Workspace only: project name plus share and AI sidebar actions. */
  projectName?: string;
  isAiSidebarOpen?: boolean;
  onToggleAiSidebar?: () => void;
  onShare?: () => void;
}

export function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
  projectName,
  isAiSidebarOpen = false,
  onToggleAiSidebar,
  onShare,
}: EditorNavbarProps) {
  const ToggleIcon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen;

  return (
    <header className="relative z-40 grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-border bg-background px-3">
      <div className="flex min-w-0 items-center justify-start">
        <Button
          variant="ghost"
          size="icon"
          className={brandGhostButton}
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          aria-expanded={isSidebarOpen}
        >
          <ToggleIcon className="h-5 w-5" />
        </Button>
        {projectName ? (
          <div className="ml-2 flex min-w-0 flex-col leading-tight">
            <h1 className="truncate text-sm font-medium text-foreground">
              {projectName}
            </h1>
            <span className="text-xs text-muted-foreground">Workspace</span>
          </div>
        ) : null}
      </div>
      <div className="flex min-w-0 items-center justify-center" />
      <div className="flex items-center justify-end gap-2">
        {onToggleAiSidebar ? (
          <>
            <Button variant="outline" size="sm" onClick={onShare}>
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button
              size="sm"
              className={brandButton}
              onClick={onToggleAiSidebar}
              aria-label={
                isAiSidebarOpen ? "Close AI sidebar" : "Open AI sidebar"
              }
              aria-expanded={isAiSidebarOpen}
            >
              <Sparkles className="h-4 w-4" />
              AI
            </Button>
          </>
        ) : null}
        <UserButton />
      </div>
    </header>
  );
}
