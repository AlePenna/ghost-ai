"use client";

import {
  Handle,
  NodeResizer,
  Position,
  useReactFlow,
  type NodeProps,
} from "@xyflow/react";
import { useCallback } from "react";

import { NodeColorToolbar } from "@/components/editor/node-color-toolbar";
import { NodeLabel } from "@/components/editor/node-label";
import { NodeShapeVisual } from "@/components/editor/node-shape";
import {
  MIN_NODE_SIZE,
  type CanvasEdge,
  type NodeColor,
  type CanvasNode as CanvasNodeType,
} from "@/types/canvas";

const HANDLE_POSITIONS = [
  Position.Top,
  Position.Right,
  Position.Bottom,
  Position.Left,
] as const;

/**
 * Small white dots with a dark border, hidden until the node is hovered. They
 * stay hit-testable while transparent, so a connection can still be dropped
 * onto them.
 */
const HANDLE_CLASS =
  "h-2! w-2! min-w-0! min-h-0! rounded-full! border! border-base! bg-copy-primary! opacity-0 transition-opacity duration-150 group-hover:opacity-100";

/**
 * Renderer for the `canvasNode` type: draws `data.shape` with an editable
 * centered label, connection handles on all four sides (revealed on hover;
 * `ConnectionMode.Loose` lets any handle start or end an edge), plus resize
 * handles and a color toolbar while selected. Resizes, label edits and color
 * changes go through React Flow's node changes, which Liveblocks syncs.
 */
export function CanvasNode({ id, data, selected }: NodeProps<CanvasNodeType>) {
  const { updateNodeData } = useReactFlow<CanvasNodeType, CanvasEdge>();

  const handleLabelChange = useCallback(
    (label: string) => updateNodeData(id, { label }),
    [id, updateNodeData],
  );

  const handleColorChange = useCallback(
    (color: NodeColor) => updateNodeData(id, { color }),
    [id, updateNodeData],
  );

  return (
    <div className="group h-full w-full">
      <NodeColorToolbar
        isVisible={selected}
        color={data.color}
        onChange={handleColorChange}
      />
      <NodeResizer
        isVisible={selected}
        minWidth={MIN_NODE_SIZE.width}
        minHeight={MIN_NODE_SIZE.height}
        color="var(--accent-primary)"
        handleClassName="h-2! w-2! rounded-sm! border! border-brand! bg-base!"
        lineClassName="border-accent-dim!"
      />
      <NodeShapeVisual shape={data.shape} color={data.color} selected={selected}>
        <NodeLabel label={data.label} onChange={handleLabelChange} />
      </NodeShapeVisual>
      {HANDLE_POSITIONS.map((position) => (
        <Handle
          key={position}
          id={position}
          type="source"
          position={position}
          className={HANDLE_CLASS}
        />
      ))}
    </div>
  );
}
