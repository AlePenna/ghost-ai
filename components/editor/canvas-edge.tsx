"use client";

import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
  type EdgeProps,
} from "@xyflow/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { EdgeLabel } from "@/components/editor/edge-label";
import {
  EDGE_COLOR,
  EDGE_INTERACTION_WIDTH,
  EDGE_STROKE_WIDTH,
  type CanvasEdge as CanvasEdgeType,
  type CanvasNode,
} from "@/types/canvas";

/** Opacity of an edge at rest; hovered or selected edges are fully opaque. */
const REST_OPACITY = 0.55;

/**
 * Renderer for the `canvasEdge` type: right-angle (smooth step) routing,
 * dimmed at rest and brightened on hover or selection. A wide transparent
 * interaction path makes the thin line easy to hover and click.
 * Double-clicking the edge or its label opens an inline label editor; the
 * label is saved to `data.label` through React Flow's edge changes, which
 * Liveblocks syncs.
 */
export function CanvasEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  style,
  selected,
  data,
}: EdgeProps<CanvasEdgeType>) {
  const { updateEdgeData } = useReactFlow<CanvasNode, CanvasEdgeType>();
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const groupRef = useRef<SVGGElement>(null);

  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 8,
  });

  // React Flow zooms on double-click through a native listener on the pane,
  // which runs before React's root listener, so stop it natively.
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    const handleDoubleClick = (event: MouseEvent) => {
      event.stopPropagation();
      setIsEditing(true);
    };
    group.addEventListener("dblclick", handleDoubleClick);
    return () => group.removeEventListener("dblclick", handleDoubleClick);
  }, []);

  const handleSave = useCallback(
    (label: string) => {
      setIsEditing(false);
      updateEdgeData(id, { label });
    },
    [id, updateEdgeData],
  );

  const isActive = isHovered || Boolean(selected);
  const label = typeof data?.label === "string" ? data.label : "";

  return (
    <>
      <g
        ref={groupRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          opacity: isActive ? 1 : REST_OPACITY,
          transition: "opacity 150ms ease",
        }}
      >
        <BaseEdge
          path={path}
          markerEnd={markerEnd}
          interactionWidth={EDGE_INTERACTION_WIDTH}
          style={{
            stroke: EDGE_COLOR,
            strokeWidth: EDGE_STROKE_WIDTH,
            strokeLinecap: "round",
            strokeLinejoin: "round",
            ...style,
            ...(selected ? { stroke: "var(--accent-primary)" } : null),
          }}
        />
      </g>
      <EdgeLabelRenderer>
        <EdgeLabel
          x={labelX}
          y={labelY}
          label={label}
          isActive={isActive}
          isEditing={isEditing}
          onStartEditing={() => setIsEditing(true)}
          onSave={handleSave}
          onHoverChange={setIsHovered}
        />
      </EdgeLabelRenderer>
    </>
  );
}
