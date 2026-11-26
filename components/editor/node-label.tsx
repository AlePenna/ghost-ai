"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";

const PLACEHOLDER = "Add label";

/**
 * Shared text styles for the static label and the textarea, so switching
 * between them doesn't move the text.
 */
const TEXT_CLASS =
  "col-start-1 row-start-1 m-0 whitespace-pre-wrap wrap-break-word p-0 text-center [font:inherit]";

interface NodeLabelProps {
  label: string;
  /** Called on every keystroke while editing. */
  onChange: (label: string) => void;
}

/**
 * Centered node label. Double-click opens a textarea laid exactly over the
 * text; it closes on blur or Escape.
 *
 * The label and textarea share one grid cell, and an invisible copy of the
 * text sizes that cell, so the textarea grows with its content and opening
 * or closing the editor causes no layout shift.
 */
export function NodeLabel({ label, onChange }: NodeLabelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // React Flow zooms on double-click through a native listener on the pane,
  // which runs before React's root listener. A native listener here stops
  // the event first, both to open the editor and to keep double-clicks
  // inside the textarea (word selection) from zooming.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleDoubleClick = (event: MouseEvent) => {
      event.stopPropagation();
      setIsEditing(true);
    };
    container.addEventListener("dblclick", handleDoubleClick);
    return () => container.removeEventListener("dblclick", handleDoubleClick);
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!isEditing || !textarea) return;
    textarea.focus();
    const end = textarea.value.length;
    textarea.setSelectionRange(end, end);
  }, [isEditing]);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // Keep typing away from canvas shortcuts.
    event.stopPropagation();
    if (event.key === "Escape") {
      event.preventDefault();
      event.currentTarget.blur();
    }
  };

  /** Keyboard equivalent of double-click on the focused label. */
  const handleLabelKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    // Keep Enter/Space away from React Flow and the canvas shortcuts.
    event.preventDefault();
    event.stopPropagation();
    setIsEditing(true);
  };

  const isEmpty = label.length === 0;
  // A trailing newline collapses in the sizing copy; a zero-width space keeps
  // the extra line so the textarea grows with it.
  const sizingText = isEmpty ? PLACEHOLDER : `${label}​`;

  return (
    <div
      ref={containerRef}
      className="nodrag nopan grid min-w-0 max-w-full cursor-text rounded-md px-1"
    >
      <span
        className={`${TEXT_CLASS} ${isEditing ? "invisible" : ""} ${
          isEmpty ? "text-copy-muted" : ""
        }`}
        aria-hidden={isEditing}
        role={isEditing ? undefined : "button"}
        tabIndex={isEditing ? -1 : 0}
        aria-label={isEditing ? undefined : `Edit label: ${label || PLACEHOLDER}`}
        onKeyDown={isEditing ? undefined : handleLabelKeyDown}
      >
        {isEditing ? sizingText : isEmpty ? PLACEHOLDER : label}
      </span>
      {isEditing && (
        <textarea
          ref={textareaRef}
          value={label}
          placeholder={PLACEHOLDER}
          rows={1}
          cols={1}
          aria-label="Node label"
          className={`${TEXT_CLASS} h-full w-full min-w-0 resize-none overflow-hidden border-0 bg-transparent text-inherit caret-current outline-none placeholder:text-copy-muted`}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => setIsEditing(false)}
        />
      )}
    </div>
  );
}
