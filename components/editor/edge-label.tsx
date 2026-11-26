"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";

const HINT = "Double-click to add label";

/** Shared text styles for the sizing copy and the input, so widths match. */
const TEXT_CLASS =
  "col-start-1 row-start-1 m-0 whitespace-pre p-0 text-[11px] leading-4 [font-family:inherit]";

interface EdgeLabelProps {
  /** Path midpoint from `getSmoothStepPath`, in flow coordinates. */
  x: number;
  y: number;
  label: string;
  /** The edge is hovered or selected. */
  isActive: boolean;
  isEditing: boolean;
  onStartEditing: () => void;
  /** Called once when editing ends (blur, Enter or Escape). */
  onSave: (label: string) => void;
  onHoverChange: (isHovered: boolean) => void;
}

/**
 * Edge label rendered inside `EdgeLabelRenderer` at the path midpoint.
 * Saved labels show as small pills; an active edge without a label shows a
 * faint hint. While editing, an input grows with its text (an invisible copy
 * of the text sizes the shared grid cell).
 */
export function EdgeLabel({
  x,
  y,
  label,
  isActive,
  isEditing,
  onStartEditing,
  onSave,
  onHoverChange,
}: EdgeLabelProps) {
  const [draft, setDraft] = useState(label);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Native listener: React Flow's double-click zoom runs before React's.
  // `onStartEditing` can change identity each render, so read it from a ref.
  const startEditingRef = useRef(onStartEditing);
  useEffect(() => {
    startEditingRef.current = onStartEditing;
  });
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleDoubleClick = (event: MouseEvent) => {
      event.stopPropagation();
      startEditingRef.current();
    };
    container.addEventListener("dblclick", handleDoubleClick);
    return () => container.removeEventListener("dblclick", handleDoubleClick);
  }, []);

  // Start each edit from the saved label.
  const [wasEditing, setWasEditing] = useState(isEditing);
  if (isEditing !== wasEditing) {
    setWasEditing(isEditing);
    if (isEditing) setDraft(label);
  }

  useEffect(() => {
    const input = inputRef.current;
    if (!isEditing || !input) return;
    input.focus();
    input.select();
  }, [isEditing]);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    // Keep typing away from canvas shortcuts (e.g. Backspace deleting the edge).
    event.stopPropagation();
    if (event.key === "Enter" || event.key === "Escape") {
      event.preventDefault();
      event.currentTarget.blur();
    }
  };

  const showHint = !isEditing && label.length === 0 && isActive;
  const isVisible = isEditing || label.length > 0 || showHint;

  return (
    <div
      ref={containerRef}
      className="nodrag nopan absolute"
      style={{
        transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
        // Labels sit in a layer that ignores pointer events by default.
        pointerEvents: isVisible ? "all" : "none",
      }}
      onPointerDown={(event) => event.stopPropagation()}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
    >
      {isEditing ? (
        <div className="grid min-w-10 rounded-full border border-brand bg-surface px-2 py-0.5 text-copy-primary">
          <span className={`${TEXT_CLASS} invisible`} aria-hidden>
            {draft || " "}
          </span>
          <input
            ref={inputRef}
            value={draft}
            aria-label="Edge label"
            className={`${TEXT_CLASS} w-full min-w-0 border-0 bg-transparent outline-none`}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => onSave(draft.trim())}
          />
        </div>
      ) : label.length > 0 ? (
        <div className="cursor-text whitespace-pre rounded-full border border-surface-border bg-surface px-2 py-0.5 text-[11px] leading-4 text-copy-secondary">
          {label}
        </div>
      ) : showHint ? (
        <div className="cursor-text whitespace-nowrap px-1 text-[10px] leading-4 text-copy-faint">
          {HINT}
        </div>
      ) : null}
    </div>
  );
}
