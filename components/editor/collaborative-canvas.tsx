"use client";

import {
  useCanRedo,
  useCanUndo,
  useRedo,
  useRoom,
  useUndo,
} from "@liveblocks/react/suspense";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type DefaultEdgeOptions,
  type EdgeTypes,
  type NodeTypes,
  type XYPosition,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useRef, type DragEvent } from "react";

import { CanvasControls } from "@/components/editor/canvas-controls";
import { CanvasEdge as CanvasEdgeRenderer } from "@/components/editor/canvas-edge";
import { CanvasNode as CanvasNodeRenderer } from "@/components/editor/canvas-node";
import { ShapePanel } from "@/components/editor/shape-panel";
import type { CanvasTemplate } from "@/components/editor/starter-templates";
import { useRegisterTemplateImporter } from "@/components/editor/template-import-context";
import {
  ZOOM_ANIMATION_MS,
  useKeyboardShortcuts,
} from "@/hooks/useKeyboardShortcuts";
import { SHAPE_DRAG_MIME, parseShapePayload } from "@/lib/shape-drag";
import {
  CANVAS_EDGE_DEFAULTS,
  CANVAS_EDGE_TYPE,
  CANVAS_NODE_TYPE,
  DEFAULT_NODE_COLOR,
  DEFAULT_SHAPE_SIZES,
  type CanvasEdge,
  type CanvasNode,
  type NodeShape,
  type NodeSize,
} from "@/types/canvas";

const nodeTypes: NodeTypes = { [CANVAS_NODE_TYPE]: CanvasNodeRenderer };
const edgeTypes: EdgeTypes = { [CANVAS_EDGE_TYPE]: CanvasEdgeRenderer };

/**
 * Merged into every new connection before `onConnect`, so edges are stored in
 * Liveblocks with the custom type, a light round-capped stroke and an arrow.
 */
const defaultEdgeOptions: DefaultEdgeOptions = CANVAS_EDGE_DEFAULTS;

/** React Flow canvas whose nodes and edges live in Liveblocks Storage. */
export function CollaborativeCanvas() {
  return (
    <ReactFlowProvider>
      <CanvasSurface />
    </ReactFlowProvider>
  );
}

function CanvasSurface() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    });
  const reactFlow = useReactFlow<CanvasNode, CanvasEdge>();
  const { screenToFlowPosition, fitView } = reactFlow;
  const room = useRoom();
  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  useKeyboardShortcuts({ reactFlow, onUndo: undo, onRedo: redo });
  const surfaceRef = useRef<HTMLDivElement>(null);

  /** Adds a node of `shape` centered on `center` (screen coordinates). */
  const addShape = useCallback(
    (shape: NodeShape, size: NodeSize, center: XYPosition) => {
      const position = screenToFlowPosition(center);
      const node: CanvasNode = {
        // Random UUIDs stay unique across collaborators adding nodes at once.
        id: `${shape}-${crypto.randomUUID()}`,
        type: CANVAS_NODE_TYPE,
        position: {
          x: position.x - size.width / 2,
          y: position.y - size.height / 2,
        },
        width: size.width,
        height: size.height,
        data: { label: "", color: DEFAULT_NODE_COLOR, shape },
      };
      onNodesChange([{ type: "add", item: node }]);
    },
    [onNodesChange, screenToFlowPosition],
  );

  /**
   * Replaces the whole canvas with `template` in one Liveblocks batch (a single
   * undo step): delete every current node and edge, then add the template's
   * through the same change handlers React Flow uses.
   */
  const importTemplate = useCallback(
    (template: CanvasTemplate) => {
      room.batch(() => {
        onDelete({ nodes, edges });
        onNodesChange(
          template.nodes.map((node) => ({
            type: "add",
            item: structuredClone(node),
          })),
        );
        onEdgesChange(
          template.edges.map((edge) => ({
            type: "add",
            item: structuredClone(edge),
          })),
        );
      });
      // Wait a frame so React Flow has the new nodes before fitting to them.
      requestAnimationFrame(() => {
        void fitView({ duration: ZOOM_ANIMATION_MS });
      });
    },
    [room, nodes, edges, onDelete, onNodesChange, onEdgesChange, fitView],
  );
  useRegisterTemplateImporter(importTemplate);

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    if (!event.dataTransfer.types.includes(SHAPE_DRAG_MIME)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, []);

  /** Drop: center the node on the cursor. */
  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      const payload = parseShapePayload(
        event.dataTransfer.getData(SHAPE_DRAG_MIME),
      );
      if (!payload) return;
      event.preventDefault();
      addShape(payload.shape, payload.size, {
        x: event.clientX,
        y: event.clientY,
      });
    },
    [addShape],
  );

  /** Click/keyboard: center the node in the visible canvas area. */
  const handleActivateShape = useCallback(
    (shape: NodeShape) => {
      const rect = surfaceRef.current?.getBoundingClientRect();
      if (!rect) return;
      addShape(shape, DEFAULT_SHAPE_SIZES[shape], {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    },
    [addShape],
  );

  return (
    <div
      ref={surfaceRef}
      className="relative h-full w-full"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        connectionMode={ConnectionMode.Loose}
        colorMode="dark"
        fitView
        className="bg-base!"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="var(--text-faint)"
          // React Flow's dark mode paints its own grey; match the page instead.
          bgColor="var(--bg-base)"
        />
        <MiniMap
          // Shift left of the AI panel when it's open (inset set by EditorShell).
          style={{ marginRight: "calc(15px + var(--canvas-inset-right, 0px))" }}
          pannable
          zoomable
          bgColor="var(--bg-surface)"
          maskColor="var(--accent-primary-dim)"
          nodeColor="var(--bg-subtle)"
        />
      </ReactFlow>
      <ShapePanel onActivateShape={handleActivateShape} />
      <CanvasControls
        reactFlow={reactFlow}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />
    </div>
  );
}
