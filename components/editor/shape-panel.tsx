"use client";

import {
  Circle,
  Cylinder,
  Diamond,
  Hexagon,
  Pill,
  RectangleHorizontal,
  type LucideIcon,
} from "lucide-react";
import { useRef, type DragEvent, type RefObject } from "react";

import { NodeShapeVisual } from "@/components/editor/node-shape";
import { SHAPE_DRAG_MIME, serializeShapePayload } from "@/lib/shape-drag";
import {
  DEFAULT_NODE_COLOR,
  DEFAULT_SHAPE_SIZES,
  NODE_SHAPES,
  type NodeShape,
} from "@/types/canvas";

const SHAPE_ICONS: Record<NodeShape, LucideIcon> = {
  rectangle: RectangleHorizontal,
  diamond: Diamond,
  circle: Circle,
  pill: Pill,
  cylinder: Cylinder,
  hexagon: Hexagon,
};

/**
 * Off-screen ghost previews, one per shape at its default drop size, used as
 * the native drag image. The browser keeps it under the cursor for the whole
 * drag and removes it on drop or cancel.
 */
function DragPreviews({
  previewRefs,
}: {
  previewRefs: RefObject<Partial<Record<NodeShape, HTMLDivElement | null>>>;
}) {
  return (
    // Must stay rendered (not display:none) for setDragImage to snapshot it.
    <div aria-hidden className="pointer-events-none fixed top-0 -left-[10000px]">
      {NODE_SHAPES.map((shape) => {
        const { width, height } = DEFAULT_SHAPE_SIZES[shape];
        return (
          <div
            key={shape}
            ref={(el) => {
              previewRefs.current[shape] = el;
            }}
            className="opacity-70"
            style={{ width, height }}
          >
            <NodeShapeVisual shape={shape} color={DEFAULT_NODE_COLOR} />
          </div>
        );
      })}
    </div>
  );
}

interface ShapePanelProps {
  /** Click/keyboard activation: add the shape at the canvas center. */
  onActivateShape: (shape: NodeShape) => void;
}

/**
 * Floating bottom toolbar. Click a shape to add it at the center of the
 * visible canvas, or drag it onto the canvas to place it at the cursor.
 */
export function ShapePanel({ onActivateShape }: ShapePanelProps) {
  const previewRefs = useRef<Partial<Record<NodeShape, HTMLDivElement | null>>>({});

  function handleDragStart(event: DragEvent<HTMLButtonElement>, shape: NodeShape) {
    const size = DEFAULT_SHAPE_SIZES[shape];
    event.dataTransfer.setData(SHAPE_DRAG_MIME, serializeShapePayload({ shape, size }));
    event.dataTransfer.effectAllowed = "copy";

    // Center the ghost on the cursor, matching where the node is dropped.
    const preview = previewRefs.current[shape];
    if (preview) {
      event.dataTransfer.setDragImage(preview, size.width / 2, size.height / 2);
    }
  }

  return (
    <>
      <div
        role="toolbar"
        aria-label="Shapes"
        className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-surface-border bg-surface/90 p-1.5 shadow-lg backdrop-blur"
      >
        {NODE_SHAPES.map((shape) => {
          const Icon = SHAPE_ICONS[shape];
          return (
            <button
              key={shape}
              type="button"
              draggable
              onDragStart={(event) => handleDragStart(event, shape)}
              onClick={() => onActivateShape(shape)}
              title={`Add ${shape} (click to center, or drag to place)`}
              aria-label={`Add ${shape}: click to add at canvas center, or drag onto the canvas`}
              className="flex h-9 w-9 cursor-grab items-center justify-center rounded-full text-copy-secondary transition-colors hover:bg-subtle hover:text-copy-primary active:cursor-grabbing"
            >
              <Icon className="h-5 w-5" />
            </button>
          );
        })}
      </div>
      <DragPreviews previewRefs={previewRefs} />
    </>
  );
}
