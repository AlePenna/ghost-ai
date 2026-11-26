"use client";

import type { NodeProps } from "@xyflow/react";
import type { CSSProperties } from "react";

import type { CanvasNode as CanvasNodeType, NodeShape } from "@/types/canvas";

type SvgShape = Extract<NodeShape, "diamond" | "hexagon" | "cylinder">;
type CssShape = Exclude<NodeShape, SvgShape>;

/** Border radius for shapes drawn with CSS borders. */
const CSS_SHAPE_RADIUS: Record<CssShape, string> = {
  rectangle: "rounded-xl",
  circle: "rounded-full",
  pill: "rounded-full",
};

/** Height of the cylinder's top/bottom ellipses, in viewBox units (0-100). */
const CYLINDER_CAP = 12;

function isSvgShape(shape: NodeShape): shape is SvgShape {
  return shape === "diamond" || shape === "hexagon" || shape === "cylinder";
}

/**
 * Outline for complex shapes in a 100x100 viewBox, stretched to the node's
 * size. `non-scaling-stroke` keeps the border 1px wide at any aspect ratio.
 */
function ShapeOutline({
  shape,
  fill,
  stroke,
}: {
  shape: SvgShape;
  fill: string;
  stroke: string;
}) {
  const common = {
    fill,
    stroke,
    strokeWidth: 1,
    vectorEffect: "non-scaling-stroke" as const,
  };
  const c = CYLINDER_CAP / 2;

  return (
    <svg
      className="absolute inset-0 h-full w-full overflow-visible"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      {shape === "diamond" && <polygon points="50,0 100,50 50,100 0,50" {...common} />}
      {shape === "hexagon" && (
        <polygon points="20,0 80,0 100,50 80,100 20,100 0,50" {...common} />
      )}
      {shape === "cylinder" && (
        <>
          <path
            d={`M0,${c} L0,${100 - c} A50,${c} 0 0 0 100,${100 - c} L100,${c}`}
            {...common}
          />
          <ellipse cx="50" cy={c} rx="50" ry={c} {...common} />
        </>
      )}
    </svg>
  );
}

/** Renderer for the `canvasNode` type: draws `data.shape` with a centered label. */
export function CanvasNode({ data, selected }: NodeProps<CanvasNodeType>) {
  const borderColor = selected ? "var(--accent-primary)" : "var(--border-subtle)";
  const labelClass =
    "relative flex h-full w-full items-center justify-center text-center text-sm wrap-break-word";

  if (isSvgShape(data.shape)) {
    // Keep the label inside the shape's usable area.
    const padding: CSSProperties =
      data.shape === "diamond"
        ? { padding: "0 25%" }
        : data.shape === "hexagon"
          ? { padding: "0 20%" }
          : { padding: `${CYLINDER_CAP}% 12px 0` };

    return (
      <div className="relative h-full w-full" style={{ color: data.color.text }}>
        <ShapeOutline shape={data.shape} fill={data.color.fill} stroke={borderColor} />
        <div className={labelClass} style={padding}>
          {data.label}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${labelClass} border px-3 ${CSS_SHAPE_RADIUS[data.shape]}`}
      style={{
        backgroundColor: data.color.fill,
        color: data.color.text,
        borderColor,
      }}
    >
      {data.label}
    </div>
  );
}
