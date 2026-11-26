// Shared canvas schema: used by user-created content, templates, and AI output.

import type { Edge, Node } from "@xyflow/react";

/** Fill/text pairs tuned for the dark canvas. The first entry is the default. */
export const NODE_COLORS = [
  { fill: "#1F1F1F", text: "#EDEDED" }, // Neutral dark
  { fill: "#10233D", text: "#52A8FF" }, // Blue
  { fill: "#2E1938", text: "#BF7AF0" }, // Purple
  { fill: "#331B00", text: "#FF990A" }, // Orange
  { fill: "#3C1618", text: "#FF6166" }, // Red
  { fill: "#3A1726", text: "#F75F8F" }, // Pink
  { fill: "#0F2E18", text: "#62C073" }, // Green
  { fill: "#062822", text: "#0AC7B4" }, // Teal
] as const;

export type NodeColor = (typeof NODE_COLORS)[number];

export const DEFAULT_NODE_COLOR: NodeColor = NODE_COLORS[0];

export const NODE_SHAPES = [
  "rectangle",
  "diamond",
  "circle",
  "pill",
  "cylinder",
  "hexagon",
] as const;

export type NodeShape = (typeof NODE_SHAPES)[number];

export const DEFAULT_NODE_SHAPE: NodeShape = "rectangle";

/** Custom React Flow node/edge type keys. */
export const CANVAS_NODE_TYPE = "canvasNode";
export const CANVAS_EDGE_TYPE = "canvasEdge";

export interface CanvasNodeData extends Record<string, unknown> {
  label: string;
  color: NodeColor;
  shape: NodeShape;
}

export type CanvasNode = Node<CanvasNodeData, typeof CANVAS_NODE_TYPE>;

export type CanvasEdge = Edge<Record<string, unknown>, typeof CANVAS_EDGE_TYPE>;

export interface NodeSize {
  width: number;
  height: number;
}

/** Default size of a newly created node, per shape. */
export const DEFAULT_SHAPE_SIZES: Record<NodeShape, NodeSize> = {
  rectangle: { width: 160, height: 80 },
  diamond: { width: 180, height: 120 },
  circle: { width: 100, height: 100 },
  pill: { width: 160, height: 60 },
  cylinder: { width: 120, height: 100 },
  hexagon: { width: 160, height: 90 },
};

export function isNodeShape(value: unknown): value is NodeShape {
  return (
    typeof value === "string" && (NODE_SHAPES as readonly string[]).includes(value)
  );
}
