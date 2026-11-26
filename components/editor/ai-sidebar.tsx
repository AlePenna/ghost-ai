"use client";

import { Bot, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

interface AiSidebarProps {
  isOpen: boolean;
}

/**
 * Right-hand AI panel. Floats over the canvas (absolute, above it in z-order)
 * and slides fully off-screen when closed. Desktop only.
 */
export function AiSidebar({ isOpen }: AiSidebarProps) {
  return (
    <aside
      aria-label="AI Copilot"
      aria-hidden={!isOpen}
      inert={!isOpen}
      className={cn(
        "absolute top-3 right-3 bottom-3 z-30 hidden w-80 flex-col rounded-2xl border border-surface-border bg-surface/90 shadow-2xl backdrop-blur-md md:flex",
        // `invisible` flips after the slide finishes, so the shadow can't peek.
        "transition-[translate,visibility] duration-200 ease-out",
        isOpen ? "translate-x-0" : "invisible translate-x-[calc(100%+2rem)]",
      )}
    >
      <div className="flex items-start justify-between border-b border-surface-border px-5 py-4">
        <div>
          <h2 className="text-sm font-medium text-copy-primary">AI Copilot</h2>
          <p className="text-xs text-copy-muted">Placeholder panel</p>
        </div>
        <Sparkles className="h-4 w-4 text-brand" />
      </div>
      <div className="m-4 flex gap-3 rounded-2xl border border-surface-border p-4">
        <Bot className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
        <div>
          <h3 className="text-sm font-medium text-copy-primary">
            Chat surface pending
          </h3>
          <p className="mt-1 text-xs leading-5 text-copy-muted">
            The toggle is wired. Messaging and generation are intentionally out
            of scope here.
          </p>
        </div>
      </div>
      <div className="mx-4 mt-auto mb-4 rounded-2xl border border-dashed border-surface-border p-4">
        <p className="text-xs tracking-[0.2em] text-copy-muted uppercase">
          Future hooks
        </p>
        <p className="mt-2 text-sm leading-6 text-copy-muted">
          Prompt composer, run status, and architecture guidance will attach to
          this sidebar.
        </p>
      </div>
    </aside>
  );
}
