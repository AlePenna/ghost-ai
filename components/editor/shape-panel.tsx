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
import type { DragEvent } from "react";

import { SHAPE_DRAG_MIME, serializeShapePayload } from "@/lib/shape-drag";
import { DEFAULT_SHAPE_SIZES, NODE_SHAPES, type NodeShape } from "@/types/canvas";

const SHAPE_ICONS: Record<NodeShape, LucideIcon> = {
  rectangle: RectangleHorizontal,
  diamond: Diamond,
  circle: Circle,
  pill: Pill,
  cylinder: Cylinder,
  hexagon: Hexagon,
};

function handleDragStart(event: DragEvent<HTMLButtonElement>, shape: NodeShape) {
  event.dataTransfer.setData(
    SHAPE_DRAG_MIME,
    serializeShapePayload({ shape, size: DEFAULT_SHAPE_SIZES[shape] }),
  );
  event.dataTransfer.effectAllowed = "copy";
}

/** Floating bottom toolbar; drag a shape onto the canvas to create a node. */
export function ShapePanel() {
  return (
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
            title={`Drag to add ${shape}`}
            aria-label={`Drag to add ${shape}`}
            className="flex h-9 w-9 cursor-grab items-center justify-center rounded-full text-copy-secondary transition-colors hover:bg-subtle hover:text-copy-primary active:cursor-grabbing"
          >
            <Icon className="h-5 w-5" />
          </button>
        );
      })}
    </div>
  );
}
