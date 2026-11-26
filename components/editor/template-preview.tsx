import type { CanvasTemplate } from "@/components/editor/starter-templates";
import type { CanvasNode } from "@/types/canvas";

/** Flow-space margin around the diagram inside the preview. */
const PREVIEW_PADDING = 24;

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

function nodeBox(node: CanvasNode): Box {
  return {
    x: node.position.x,
    y: node.position.y,
    width: node.width ?? 0,
    height: node.height ?? 0,
  };
}

function center({ x, y, width, height }: Box) {
  return { x: x + width / 2, y: y + height / 2 };
}

/** Bounds of all nodes, padded; becomes the SVG viewBox. */
function previewBounds(nodes: CanvasNode[]): Box {
  if (nodes.length === 0) return { x: 0, y: 0, width: 1, height: 1 };
  const boxes = nodes.map(nodeBox);
  const minX = Math.min(...boxes.map((b) => b.x));
  const minY = Math.min(...boxes.map((b) => b.y));
  const maxX = Math.max(...boxes.map((b) => b.x + b.width));
  const maxY = Math.max(...boxes.map((b) => b.y + b.height));
  return {
    x: minX - PREVIEW_PADDING,
    y: minY - PREVIEW_PADDING,
    width: maxX - minX + PREVIEW_PADDING * 2,
    height: maxY - minY + PREVIEW_PADDING * 2,
  };
}

function PreviewNode({ node }: { node: CanvasNode }) {
  const { x, y, width: w, height: h } = nodeBox(node);
  const { fill, text } = node.data.color;
  const common = {
    fill,
    stroke: text,
    strokeOpacity: 0.6,
    strokeWidth: 1,
    vectorEffect: "non-scaling-stroke" as const,
  };

  switch (node.data.shape) {
    case "rectangle":
      return <rect x={x} y={y} width={w} height={h} rx={10} {...common} />;
    case "pill":
      return <rect x={x} y={y} width={w} height={h} rx={h / 2} {...common} />;
    case "circle":
      return <ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} {...common} />;
    case "diamond":
      return (
        <polygon
          points={`${x + w / 2},${y} ${x + w},${y + h / 2} ${x + w / 2},${y + h} ${x},${y + h / 2}`}
          {...common}
        />
      );
    case "hexagon":
      return (
        <polygon
          points={`${x + w * 0.2},${y} ${x + w * 0.8},${y} ${x + w},${y + h / 2} ${x + w * 0.8},${y + h} ${x + w * 0.2},${y + h} ${x},${y + h / 2}`}
          {...common}
        />
      );
    case "cylinder": {
      const cap = h * 0.06;
      return (
        <g>
          <path
            d={`M${x},${y + cap} L${x},${y + h - cap} A${w / 2},${cap} 0 0 0 ${x + w},${y + h - cap} L${x + w},${y + cap}`}
            {...common}
          />
          <ellipse cx={x + w / 2} cy={y + cap} rx={w / 2} ry={cap} {...common} />
        </g>
      );
    }
  }
}

/**
 * Static SVG thumbnail of a template: the viewBox is fitted to the node bounds,
 * edges are straight lines between node centers, nodes use their shape and
 * color. No React Flow instance involved.
 */
export function TemplatePreview({ template }: { template: CanvasTemplate }) {
  const bounds = previewBounds(template.nodes);
  const byId = new Map(template.nodes.map((node) => [node.id, node]));

  return (
    <svg
      className="h-36 w-full rounded-xl bg-base"
      viewBox={`${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      {template.edges.map((edge) => {
        const source = byId.get(edge.source);
        const target = byId.get(edge.target);
        if (!source || !target) return null;
        const from = center(nodeBox(source));
        const to = center(nodeBox(target));
        return (
          <line
            key={edge.id}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke="var(--text-faint)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
      {template.nodes.map((node) => (
        <PreviewNode key={node.id} node={node} />
      ))}
    </svg>
  );
}
