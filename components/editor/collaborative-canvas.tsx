"use client";

import { useLiveblocksFlow } from "@liveblocks/react-flow";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useRef, type DragEvent } from "react";

import { CanvasNode as CanvasNodeRenderer } from "@/components/editor/canvas-node";
import { ShapePanel } from "@/components/editor/shape-panel";
import { SHAPE_DRAG_MIME, parseShapePayload } from "@/lib/shape-drag";
import {
  CANVAS_NODE_TYPE,
  DEFAULT_NODE_COLOR,
  type CanvasEdge,
  type CanvasNode,
} from "@/types/canvas";

const nodeTypes: NodeTypes = { [CANVAS_NODE_TYPE]: CanvasNodeRenderer };

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
  const { screenToFlowPosition } = useReactFlow<CanvasNode, CanvasEdge>();
  const idCounter = useRef(0);

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    if (!event.dataTransfer.types.includes(SHAPE_DRAG_MIME)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      const payload = parseShapePayload(
        event.dataTransfer.getData(SHAPE_DRAG_MIME),
      );
      if (!payload) return;
      event.preventDefault();

      const { shape, size } = payload;
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      idCounter.current += 1;
      const node: CanvasNode = {
        id: `${shape}-${Date.now()}-${idCounter.current}`,
        type: CANVAS_NODE_TYPE,
        // Center the node on the cursor.
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

  return (
    <div
      className="relative h-full w-full"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
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
      <ShapePanel />
    </div>
  );
}
