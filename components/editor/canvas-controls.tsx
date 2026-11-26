"use client";

import type { ReactFlowInstance } from "@xyflow/react";
import {
  Maximize,
  Redo2,
  Undo2,
  ZoomIn,
  ZoomOut,
  type LucideIcon,
} from "lucide-react";

import { ZOOM_ANIMATION_MS } from "@/hooks/useKeyboardShortcuts";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";

interface ControlButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

function ControlButton({ icon: Icon, label, onClick, disabled }: ControlButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-full text-copy-secondary transition-colors hover:bg-subtle hover:text-copy-primary disabled:pointer-events-none disabled:opacity-40"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

interface CanvasControlsProps {
  reactFlow: ReactFlowInstance<CanvasNode, CanvasEdge>;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

/** Floating bottom-left pill: zoom out / fit / zoom in, then undo / redo. */
export function CanvasControls({
  reactFlow,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: CanvasControlsProps) {
  const animation = { duration: ZOOM_ANIMATION_MS };

  return (
    <div
      role="toolbar"
      aria-label="Canvas controls"
      // Bottom-left, one row above the shape panel (bottom-4 + ~50px tall), and
      // shifted right of the project sidebar while it's open (inset set by EditorShell).
      style={{ left: "calc(1rem + var(--canvas-inset-left, 0px))" }}
      className="absolute bottom-20 z-20 flex items-center gap-0.5 rounded-full border border-surface-border bg-surface/90 p-1 shadow-lg backdrop-blur transition-[left] duration-200 ease-out"
    >
      <ControlButton
        icon={ZoomOut}
        label="Zoom out (-)"
        onClick={() => void reactFlow.zoomOut(animation)}
      />
      <ControlButton
        icon={Maximize}
        label="Fit view"
        onClick={() => void reactFlow.fitView(animation)}
      />
      <ControlButton
        icon={ZoomIn}
        label="Zoom in (+)"
        onClick={() => void reactFlow.zoomIn(animation)}
      />
      <div aria-hidden className="mx-1 h-5 w-px bg-surface-border" />
      <ControlButton
        icon={Undo2}
        label="Undo (Cmd/Ctrl+Z)"
        onClick={onUndo}
        disabled={!canUndo}
      />
      <ControlButton
        icon={Redo2}
        label="Redo (Cmd/Ctrl+Shift+Z)"
        onClick={onRedo}
        disabled={!canRedo}
      />
    </div>
  );
}
