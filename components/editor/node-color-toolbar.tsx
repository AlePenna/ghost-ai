"use client";

import { NodeToolbar, Position } from "@xyflow/react";
import type { CSSProperties, PointerEvent } from "react";

import { NODE_COLOR_NAMES, NODE_COLORS, type NodeColor } from "@/types/canvas";

/** Gap between the node's top edge and the toolbar, in screen pixels. */
const TOOLBAR_OFFSET = 10;

const SWATCH_BASE_CLASS =
  "relative flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border border-surface-border-subtle outline-none transition-shadow";

/** Tight glow from the pair's text color on hover/focus. */
const SWATCH_IDLE_CLASS =
  "hover:shadow-[0_0_0_1px_var(--swatch-text),0_0_6px_0_var(--swatch-glow)] focus-visible:shadow-[0_0_0_1px_var(--swatch-text),0_0_6px_0_var(--swatch-glow)]";

/** Offset ring in the text color marks the active pair; glow adds on hover. */
const SWATCH_ACTIVE_CLASS =
  "shadow-[0_0_0_2px_var(--bg-elevated),0_0_0_3.5px_var(--swatch-text)] hover:shadow-[0_0_0_2px_var(--bg-elevated),0_0_0_3.5px_var(--swatch-text),0_0_6px_1px_var(--swatch-glow)]";

function isSameColor(a: NodeColor, b: NodeColor): boolean {
  return a.fill === b.fill && a.text === b.text;
}

/** Keeps toolbar clicks from starting a node drag or a canvas pan. */
function stopPointer(event: PointerEvent) {
  event.stopPropagation();
}

interface NodeColorToolbarProps {
  /** Shown only while the node is selected. */
  isVisible: boolean;
  color: NodeColor;
  onChange: (color: NodeColor) => void;
}

/**
 * Floating row of predefined fill/text swatches rendered just above a
 * selected node. Picking one sets both colors at once.
 */
export function NodeColorToolbar({ isVisible, color, onChange }: NodeColorToolbarProps) {
  return (
    <NodeToolbar isVisible={isVisible} position={Position.Top} offset={TOOLBAR_OFFSET}>
      <div
        role="toolbar"
        aria-label="Node color"
        className="nodrag nopan flex items-center gap-2 rounded-xl border border-surface-border bg-elevated/95 px-2.5 py-2 shadow-lg backdrop-blur"
        onPointerDown={stopPointer}
        onDoubleClick={(event) => event.stopPropagation()}
      >
        {NODE_COLORS.map((option, index) => {
          const active = isSameColor(option, color);
          const name = NODE_COLOR_NAMES[index];
          return (
            <button
              key={option.fill}
              type="button"
              title={name}
              aria-label={`${name} color`}
              aria-pressed={active}
              className={`${SWATCH_BASE_CLASS} ${active ? SWATCH_ACTIVE_CLASS : SWATCH_IDLE_CLASS}`}
              style={
                {
                  backgroundColor: option.fill,
                  "--swatch-text": option.text,
                  "--swatch-glow": `color-mix(in srgb, ${option.text} 55%, transparent)`,
                } as CSSProperties
              }
              onClick={() => onChange(option)}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: option.text }}
                aria-hidden
              />
            </button>
          );
        })}
      </div>
    </NodeToolbar>
  );
}
