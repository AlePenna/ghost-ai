import type { CSSProperties, ReactNode } from "react";

import type { NodeColor, NodeShape } from "@/types/canvas";

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

/** Keeps the label inside each SVG shape's usable area. */
const SVG_LABEL_PADDING: Record<SvgShape, CSSProperties> = {
  diamond: { padding: "0 25%" },
  hexagon: { padding: "0 20%" },
  // Vertical padding % resolves against width, so inset with `top` instead,
  // which resolves against height and clears the top cap at any size.
  cylinder: {
    position: "absolute",
    inset: `${CYLINDER_CAP}% 12px 0`,
    width: "auto",
    height: "auto",
  },
};

const LABEL_CLASS =
  "relative flex h-full w-full items-center justify-center text-center text-sm wrap-break-word";

function isSvgShape(shape: NodeShape): shape is SvgShape {
  return shape === "diamond" || shape === "hexagon" || shape === "cylinder";
}

/**
 * Outline for complex shapes in a 100x100 viewBox, stretched to the parent's
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

interface NodeShapeVisualProps {
  shape: NodeShape;
  color: NodeColor;
  /** Brighter border for selected nodes; subtle otherwise. */
  selected?: boolean;
  children?: ReactNode;
}

/**
 * Draws a node shape that fills its parent: rectangle/circle/pill with CSS,
 * diamond/hexagon/cylinder with a stretched SVG. Shared by canvas nodes and
 * the shape-panel drag preview so both look the same.
 */
export function NodeShapeVisual({
  shape,
  color,
  selected = false,
  children,
}: NodeShapeVisualProps) {
  const borderColor = selected ? "var(--accent-primary)" : "var(--border-subtle)";

  if (isSvgShape(shape)) {
    return (
      <div className="relative h-full w-full" style={{ color: color.text }}>
        <ShapeOutline shape={shape} fill={color.fill} stroke={borderColor} />
        <div className={LABEL_CLASS} style={SVG_LABEL_PADDING[shape]}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${LABEL_CLASS} border px-3 transition-colors ${CSS_SHAPE_RADIUS[shape]}`}
      style={{
        backgroundColor: color.fill,
        color: color.text,
        borderColor,
      }}
    >
      {children}
    </div>
  );
}
