"use client";

import type { ReactFlowInstance } from "@xyflow/react";
import { useEffect } from "react";

import type { CanvasEdge, CanvasNode } from "@/types/canvas";

/** Duration of zoom animations, shared with the canvas control bar. */
export const ZOOM_ANIMATION_MS = 200;

interface KeyboardShortcutOptions {
  reactFlow: ReactFlowInstance<CanvasNode, CanvasEdge>;
  onUndo: () => void;
  onRedo: () => void;
}

/** True when the event comes from a field the user is typing in. */
function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target.isContentEditable
  );
}

/** True when the event comes from inside a modal (share, templates, ...). */
function isInsideDialog(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest('[role="dialog"]') !== null;
}

/**
 * Canvas shortcuts on `window`: `+`/`=` zoom in, `-` zoom out,
 * Cmd/Ctrl+Z undo, Cmd/Ctrl+Shift+Z or Cmd/Ctrl+Y redo.
 * Ignored while typing in inputs, textareas or editable text fields, and for
 * events from inside an open dialog.
 */
export function useKeyboardShortcuts({
  reactFlow,
  onUndo,
  onRedo,
}: KeyboardShortcutOptions) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isEditableTarget(event.target) || isInsideDialog(event.target)) {
        return;
      }

      const key = event.key.toLowerCase();
      const mod = event.metaKey || event.ctrlKey;

      if (mod && !event.altKey) {
        if (key === "z") {
          event.preventDefault();
          if (event.shiftKey) onRedo();
          else onUndo();
        } else if (key === "y" && !event.shiftKey) {
          event.preventDefault();
          onRedo();
        }
        return;
      }

      // Plain keys only, so browser zoom (Cmd/Ctrl +/-) keeps working.
      if (event.altKey) return;
      if (key === "+" || key === "=") {
        event.preventDefault();
        void reactFlow.zoomIn({ duration: ZOOM_ANIMATION_MS });
      } else if (key === "-") {
        event.preventDefault();
        void reactFlow.zoomOut({ duration: ZOOM_ANIMATION_MS });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [reactFlow, onUndo, onRedo]);
}
