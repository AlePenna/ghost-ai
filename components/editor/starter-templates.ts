// Predefined starter diagrams, built from the shared canvas schema so an
// imported template is stored exactly like user-created nodes and edges.

import type { Position } from "@xyflow/react";

import {
  CANVAS_EDGE_DEFAULTS,
  CANVAS_NODE_TYPE,
  DEFAULT_SHAPE_SIZES,
  NODE_COLORS,
  NODE_COLOR_NAMES,
  type CanvasEdge,
  type CanvasNode,
  type NodeColor,
  type NodeShape,
} from "@/types/canvas";

export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

type ColorName = (typeof NODE_COLOR_NAMES)[number];
type Side = `${Position}`;

function color(name: ColorName): NodeColor {
  return NODE_COLORS[NODE_COLOR_NAMES.indexOf(name)];
}

interface NodeSpec {
  key: string;
  shape: NodeShape;
  label: string;
  color: ColorName;
  /** Center of the node, in flow coordinates. */
  x: number;
  y: number;
}

interface EdgeSpec {
  from: string;
  to: string;
  /** Handle sides; defaults to left-to-right flow. */
  fromSide?: Side;
  toSide?: Side;
  label?: string;
}

/** Builds a template from compact specs; IDs are prefixed with the template ID. */
function defineTemplate(
  meta: Omit<CanvasTemplate, "nodes" | "edges">,
  nodes: NodeSpec[],
  edges: EdgeSpec[],
): CanvasTemplate {
  const nodeId = (key: string) => `${meta.id}-${key}`;

  return {
    ...meta,
    nodes: nodes.map((spec) => {
      const size = DEFAULT_SHAPE_SIZES[spec.shape];
      return {
        id: nodeId(spec.key),
        type: CANVAS_NODE_TYPE,
        position: { x: spec.x - size.width / 2, y: spec.y - size.height / 2 },
        width: size.width,
        height: size.height,
        data: { label: spec.label, color: color(spec.color), shape: spec.shape },
      };
    }),
    edges: edges.map((spec) => ({
      ...CANVAS_EDGE_DEFAULTS,
      id: `${nodeId(spec.from)}--${nodeId(spec.to)}`,
      source: nodeId(spec.from),
      target: nodeId(spec.to),
      sourceHandle: spec.fromSide ?? "right",
      targetHandle: spec.toSide ?? "left",
      data: spec.label ? { label: spec.label } : {},
    })),
  };
}

const microservices = defineTemplate(
  {
    id: "microservices",
    name: "Microservices",
    description:
      "API gateway routing to independent services, each owning its own database.",
  },
  [
    { key: "client", shape: "circle", label: "Client", color: "Neutral", x: 0, y: 200 },
    { key: "gateway", shape: "rectangle", label: "API Gateway", color: "Blue", x: 240, y: 200 },
    { key: "auth", shape: "rectangle", label: "Auth Service", color: "Purple", x: 520, y: 40 },
    { key: "orders", shape: "rectangle", label: "Order Service", color: "Orange", x: 520, y: 200 },
    { key: "users", shape: "rectangle", label: "User Service", color: "Green", x: 520, y: 360 },
    { key: "auth-db", shape: "cylinder", label: "Auth DB", color: "Purple", x: 780, y: 40 },
    { key: "orders-db", shape: "cylinder", label: "Orders DB", color: "Orange", x: 780, y: 200 },
    { key: "users-db", shape: "cylinder", label: "Users DB", color: "Green", x: 780, y: 360 },
  ],
  [
    { from: "client", to: "gateway", label: "HTTPS" },
    { from: "gateway", to: "auth" },
    { from: "gateway", to: "orders" },
    { from: "gateway", to: "users" },
    { from: "auth", to: "auth-db" },
    { from: "orders", to: "orders-db" },
    { from: "users", to: "users-db" },
  ],
);

const cicdPipeline = defineTemplate(
  {
    id: "cicd-pipeline",
    name: "CI/CD Pipeline",
    description:
      "Commit to production: build, test, quality gate, staging and an approved release.",
  },
  [
    { key: "commit", shape: "pill", label: "Git Push", color: "Neutral", x: 0, y: 0 },
    { key: "build", shape: "rectangle", label: "Build", color: "Blue", x: 230, y: 0 },
    { key: "test", shape: "rectangle", label: "Run Tests", color: "Blue", x: 460, y: 0 },
    { key: "gate", shape: "diamond", label: "Checks pass?", color: "Orange", x: 700, y: 0 },
    { key: "notify", shape: "pill", label: "Notify Team", color: "Red", x: 700, y: 180 },
    { key: "registry", shape: "cylinder", label: "Artifact Registry", color: "Purple", x: 940, y: 0 },
    { key: "staging", shape: "rectangle", label: "Deploy Staging", color: "Teal", x: 940, y: 180 },
    { key: "approve", shape: "diamond", label: "Approve?", color: "Orange", x: 940, y: 360 },
    { key: "prod", shape: "hexagon", label: "Production", color: "Green", x: 680, y: 360 },
  ],
  [
    { from: "commit", to: "build" },
    { from: "build", to: "test" },
    { from: "test", to: "gate" },
    { from: "gate", to: "registry", label: "yes" },
    { from: "gate", to: "notify", fromSide: "bottom", toSide: "top", label: "no" },
    { from: "registry", to: "staging", fromSide: "bottom", toSide: "top" },
    { from: "staging", to: "approve", fromSide: "bottom", toSide: "top" },
    { from: "approve", to: "prod", fromSide: "left", toSide: "right", label: "yes" },
  ],
);

const eventDriven = defineTemplate(
  {
    id: "event-driven",
    name: "Event-Driven System",
    description:
      "Producers publish to an event bus; independent consumers react and an event store keeps history.",
  },
  [
    { key: "web", shape: "rectangle", label: "Web App", color: "Neutral", x: 0, y: 60 },
    { key: "payments", shape: "rectangle", label: "Payment Service", color: "Blue", x: 0, y: 260 },
    { key: "bus", shape: "hexagon", label: "Event Bus", color: "Orange", x: 280, y: 160 },
    { key: "email", shape: "rectangle", label: "Email Worker", color: "Pink", x: 560, y: 0 },
    { key: "analytics", shape: "rectangle", label: "Analytics", color: "Purple", x: 560, y: 160 },
    { key: "inventory", shape: "rectangle", label: "Inventory", color: "Green", x: 560, y: 320 },
    { key: "store", shape: "cylinder", label: "Event Store", color: "Teal", x: 280, y: 380 },
  ],
  [
    { from: "web", to: "bus", label: "publish" },
    { from: "payments", to: "bus", label: "publish" },
    { from: "bus", to: "email" },
    { from: "bus", to: "analytics" },
    { from: "bus", to: "inventory" },
    { from: "bus", to: "store", fromSide: "bottom", toSide: "top", label: "append" },
  ],
);

export const CANVAS_TEMPLATES: readonly CanvasTemplate[] = [
  microservices,
  cicdPipeline,
  eventDriven,
];
