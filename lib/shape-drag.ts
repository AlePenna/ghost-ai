// Drag payload for creating canvas nodes from the shape panel.

import { isNodeShape, type NodeShape, type NodeSize } from "@/types/canvas";

/** Custom MIME type so drops from other sources are ignored. */
export const SHAPE_DRAG_MIME = "application/x-ghost-shape";

export interface ShapeDragPayload {
  shape: NodeShape;
  size: NodeSize;
}

export function serializeShapePayload(payload: ShapeDragPayload): string {
  return JSON.stringify(payload);
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

/** Parses and validates a dropped payload; returns null for anything unexpected. */
export function parseShapePayload(raw: string): ShapeDragPayload | null {
  if (!raw) return null;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof value !== "object" || value === null) return null;
  const { shape, size } = value as Record<string, unknown>;
  if (!isNodeShape(shape) || typeof size !== "object" || size === null) {
    return null;
  }
  const { width, height } = size as Record<string, unknown>;
  if (!isPositiveNumber(width) || !isPositiveNumber(height)) return null;
  return { shape, size: { width, height } };
}
