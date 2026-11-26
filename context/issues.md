# Issues

## 1. Hydration mismatch on Clerk `<UserButton />` in the editor navbar

**Status:** Solved

### Error

```
Recoverable Error
Hydration failed because the server rendered HTML didn't match the client.
As a result this tree will be regenerated on the client.

  <EditorNavbar ...>
    <header ...>
      <div className="flex items...">
        <withClerk(UserButton)>
          <UserButton ...>
            <ClerkHostRenderer component="UserButton" ...>
+             <div ref={{current:null}} data-clerk-component="UserButton">

at EditorNavbar (components/editor/editor-navbar.tsx:74:9)
at EditorShell (components/editor/editor-shell.tsx:36:7)
at WorkspaceContent (app/editor/[roomId]/page.tsx:23:5)
at WorkspacePage (app/editor/[roomId]/page.tsx:36:7)

> 74 |         <UserButton />
```

Next.js 16.4.6 (Turbopack), `@clerk/nextjs` 7.x. Seen on `/editor/[roomId]`.

### Root cause

Clerk wraps its UI components in `withClerk`, which does this
(`@clerk/react` dist):

```js
if (!clerk.loaded && !options?.renderWhileLoading) return null;
```

- **Server:** clerk-js never loads during SSR, so `<UserButton />` renders `null`.
- **Client:** the workspace page renders inside a `<Suspense>` boundary (needed
  because Cache Components is on and the page awaits `auth()`/data). That
  boundary's HTML streams in and hydrates late. By then clerk-js has often
  finished loading, so the first client render outputs
  `<div data-clerk-component="UserButton">`.

The server HTML has nothing there and the client has a `<div>`, so React
reports a hydration mismatch and re-renders the tree on the client. It only
happens sometimes because it depends on whether clerk-js loads before the
boundary hydrates.

### Solution

Render the Clerk button only after hydration, so the hydration render always
matches the server output (`null`):

1. Added [`hooks/use-is-hydrated.ts`](hooks/use-is-hydrated.ts), which uses
   `useSyncExternalStore` with a server snapshot of `false` and a client
   snapshot of `true`. React uses the server snapshot during hydration, then
   re-renders with `true`. This needs no `useEffect` + `setState`.
2. In [`components/editor/editor-navbar.tsx`](components/editor/editor-navbar.tsx),
   `<UserButton />` now renders only when `isHydrated` is true, inside a fixed
   `h-7 w-7` slot so the navbar doesn't shift when the avatar appears.

```tsx
const isHydrated = useIsHydrated();
// ...
<div className="flex h-7 w-7 items-center justify-center">
  {isHydrated ? <UserButton /> : null}
</div>
```

**Rule going forward:** gate any Clerk UI component (`UserButton`,
`OrganizationSwitcher`, etc.) rendered in a streamed/Suspense client tree with
`useIsHydrated()`.



## 2. LiveBlock drag and drop issue.

**Status:** Solved

Review the editor canvas implementation and fix the functionality issue.
The buttom bar loads with different shapes and I can drag any shape onto the canvas. Once dropped, the shape is visible but the only shape showing is the rectangular shape, no matter what was the selection at the beginning.
Check `/context/screenshots/image_issue_2.png`

### Root cause

The drag/drop pipeline was correct: the payload carries the right `shape`
and size, and the dropped node stores `data.shape` (the different node sizes
in the screenshot are the per-shape defaults). The renderer
`components/editor/canvas-node.tsx` ignored `data.shape` and drew every node as
a rounded rectangle, which was the placeholder from spec 12.

### Solution

`CanvasNode` now draws each shape from `data.shape`:

- `rectangle`, `circle` and `pill` use CSS borders (`rounded-xl` / `rounded-full`).
- `diamond`, `hexagon` and `cylinder` use an inline SVG outline (100x100
  viewBox, `preserveAspectRatio="none"`, `vector-effect: non-scaling-stroke`)
  stretched to the node size, as `ui-context.md` specifies. The label is padded
  so it stays inside the shape.
- Fill and text come from `data.color`; the border uses the brand accent when
  the node is selected.

## 3. Liveblock issues:

**Status:** Solved

### Liveblock Canvas visual issues
- Box shadow or elevation styles making the canvas appear to float
- Border or border-radius giving it a "card" appearance instead of a canvas feel
- Background color mismatch between canvas and its container
- Missing or incorrect dotted background pattern on the canvas
- z-index or positioning (absolute/relative) causing the floating effect
- Padding/margin around the canvas creating separation from the background
- Any wrapper div styles (like rounded corners, shadows, or elevated backgrounds) treating the canvas as a UI card


### Liveblock Canvas sidebar issues:
SIDEBAR ISSUES:

- The left and right sidebars should float OVER the canvas, not push or shrink it
- Sidebars must use position: fixed or position: absolute with a higher z-index so the canvas extends fully behind them
- The canvas background (dotted pattern) should be visible edge-to-edge underneath both sidebars
- Sidebars should have a semi-transparent or solid background with a subtle shadow so they feel elevated above the canvas, not embedded in the layout
- The left sidebar is not fully hiding when toggled off

— it is partially visible or peeking out instead of sliding completely off-screen. When closed, the sidebar should translate fully outside the viewport with no visible remnant. Check for incorrect transform: translateX values, insufficient negative offset, overflow issues on the parent container, or missing overflow: hidden that is causing the sidebar to remain partially visible during or after the close transition.

After documenting all issues fix all of the above so that:

1. The canvas has a dotted background pattern filling the full viewport naturally
2. The canvas feels flush with the surrounding background — no floating, no card effect
3. Box-shadow, excessive borders, and elevated styling are removed from the canvas
4. The canvas looks and feels like an infinite design canvas (similar to Figma or Excalidraw)
5. Both sidebars float over the canvas and are fully hidden when toggled off
6. Nodes can be dragged from the node panel and dropped onto the canvas correctly

### Root cause

- **Canvas looked like a card.** `WorkspaceCanvas`'s `<main>` had
  `rounded-2xl border`, and the workspace row in `EditorShell` was
  `flex gap-3 p-3`, which left a padded gutter of the shadcn `bg-background`
  around it. Together they made the canvas look like a floating panel.
- **Background mismatch.** React Flow's dark `colorMode` paints the
  `<Background>` SVG with its own grey (`--xy-background-color`), so the
  canvas didn't match `bg-base` even where the wrapper was `bg-base`.
- **Sidebars pushed the canvas.** The docked project sidebar was
  `md:static md:shrink-0` and the AI `<aside>` was a flex child
  (`w-80 shrink-0`), so both took width from the canvas instead of
  overlaying it.
- **Left sidebar peeked when closed.** The overlay variant slid by
  `-translate-x-[110%]` (352px). That is only 24px past its left offset, and
  `shadow-2xl` (about 50px blur) stayed visible at the viewport edge. The
  docked variant just unmounted, so it had no close transition.

### Solution

- [`components/editor/editor-shell.tsx`](components/editor/editor-shell.tsx):
  the workspace area is a single `relative overflow-hidden bg-base` container.
  The canvas fills it and both sidebars are absolute overlays (`z-30`) on top.
  It sets `--canvas-inset-right` on desktop while the AI panel is open.
- [`components/editor/workspace-canvas.tsx`](components/editor/workspace-canvas.tsx):
  `<main>` is `absolute inset-0 bg-base`, with no border, radius, or padding.
- [`components/editor/collaborative-canvas.tsx`](components/editor/collaborative-canvas.tsx):
  `<Background bgColor="var(--bg-base)">` so the dotted pattern sits on the
  page color edge to edge. The `MiniMap` shifts left by `--canvas-inset-right`
  so the AI panel doesn't cover it.
- [`components/editor/project-sidebar.tsx`](components/editor/project-sidebar.tsx):
  always mounted, `bg-background/90 backdrop-blur-md shadow-2xl`. It closes
  with `-translate-x-[calc(100%+2rem)]` plus `invisible`, and
  `transition-[translate,visibility]` applies `visibility: hidden` only after
  the slide ends, so no edge or shadow stays visible. `inert` and
  `aria-hidden` keep it out of focus and the a11y tree while closed.
- [`components/editor/ai-sidebar.tsx`](components/editor/ai-sidebar.tsx) (new):
  the AI panel is pulled out of the shell and uses the same floating and
  sliding treatment on the right (desktop only).
- Drag and drop is unchanged: the drop target is the full-size canvas wrapper,
  so shapes still drop at the cursor via `screenToFlowPosition`. Dropping onto
  an open sidebar does nothing because the sidebar sits above the canvas.

## 4: Liveblock blocks issues

**Status:** Solved

Cannot link blocks. I can move the around and resize them but not link them.

### Root cause

`canvasNode` rendered no React Flow `<Handle>` elements. React Flow only starts
a connection from a handle, so there was nothing to drag from, and `onConnect`
(already wired to Liveblocks) never fired. Connection handles and the
`canvasEdge` renderer had been left for a later unit.

### Solution

- [`components/editor/canvas-node.tsx`](components/editor/canvas-node.tsx):
  a `source` handle on each side (top/right/bottom/left, id = side). With
  the canvas's existing `ConnectionMode.Loose`, any handle can start or end an
  edge. Per `ui-context.md` they are small white circles, transparent until the
  node is hovered (`group-hover`). They still accept drops while transparent.
- [`components/editor/canvas-edge.tsx`](components/editor/canvas-edge.tsx)
  (new): `canvasEdge` renderer, a bezier curve, 1.25px, stroke `EDGE_COLOR`
  (`#f8fafc`, in `types/canvas.ts`), brand accent when selected.
- [`components/editor/collaborative-canvas.tsx`](components/editor/collaborative-canvas.tsx):
  registers `edgeTypes` and passes `defaultEdgeOptions`
  (`type: canvasEdge`, closed-arrow `markerEnd`). React Flow merges these into
  the connection before `onConnect`, so Liveblocks stores the edge with its
  type and arrow, and every collaborator sees it.