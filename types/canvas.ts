// Shared canvas schema: used by user-created content, templates, and AI output.

import {
  MarkerType,
  type DefaultEdgeOptions,
  type Edge,
  type Node,
} from "@xyflow/react";

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

/** Display names for `NODE_COLORS`, in the same order. */
export const NODE_COLOR_NAMES = [
  "Neutral",
  "Blue",
  "Purple",
  "Orange",
  "Red",
  "Pink",
  "Green",
  "Teal",
] as const satisfies { length: (typeof NODE_COLORS)["length"] };

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

/** Default edge stroke (ui-context: edges are thin and secondary to nodes). */
export const EDGE_COLOR = "#f8fafc";

/** Visible edge stroke width, in px. */
export const EDGE_STROKE_WIDTH = 1.25;

/** Width of the invisible hit area around each edge, in px. */
export const EDGE_INTERACTION_WIDTH = 24;

/**
 * Type, stroke and arrow shared by every edge: merged into new connections via
 * React Flow's `defaultEdgeOptions`, and spread into template edges so both are
 * stored in Liveblocks with the same shape.
 */
export const CANVAS_EDGE_DEFAULTS = {
  type: CANVAS_EDGE_TYPE,
  style: {
    stroke: EDGE_COLOR,
    strokeWidth: EDGE_STROKE_WIDTH,
    strokeLinecap: "round",
  },
  markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_COLOR },
} as const satisfies DefaultEdgeOptions;

export interface CanvasNodeData extends Record<string, unknown> {
  label: string;
  color: NodeColor;
  shape: NodeShape;
}

export type CanvasNode = Node<CanvasNodeData, typeof CANVAS_NODE_TYPE>;

export interface CanvasEdgeData extends Record<string, unknown> {
  /** Inline label shown at the edge midpoint; empty or missing means none. */
  label?: string;
}

export type CanvasEdge = Edge<CanvasEdgeData, typeof CANVAS_EDGE_TYPE>;

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

/** Smallest size a node can be resized to. */
export const MIN_NODE_SIZE: NodeSize = { width: 60, height: 40 };

export function isNodeShape(value: unknown): value is NodeShape {
  return (
    typeof value === "string" && (NODE_SHAPES as readonly string[]).includes(value)
  );
}
