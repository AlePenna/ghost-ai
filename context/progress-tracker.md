# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- 12-shape-panel: Drag-and-drop shape creation

## Current Goal

- Implement `context/feature-specs/12-shape-panel.md`. Done; build, tsc, eslint pass.

## Completed

- 01-design-system: shadcn/ui (base-nova) configured; Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea added; lucide-react installed; `lib/utils.ts` exports `cn()`; `dark` class applied on `<html>`; font vars fixed in globals.css. tsc + build pass.
- 02-editor: `components/editor/editor-navbar.tsx` (props: `isSidebarOpen`, `onToggleSidebar`), `project-sidebar.tsx` (props: `isOpen`, `onClose?`, `onNewProject?`; fixed overlay, slides in, doesn't push content), `app-dialog.tsx` (title/description/body/footer pattern; no dialogs instantiated). tsc + eslint pass.

- 03-auth: `ClerkProvider` (dark theme + CSS-variable appearance in `lib/clerk-appearance.ts`) in root layout; `/sign-in` and `/sign-up` pages with two-panel `AuthShell`; `proxy.ts` protects all but sign-in/up paths (read from env vars); `/` redirects to `/editor` or `/sign-in`; `UserButton` in navbar; minimal `/editor` route mounts navbar + sidebar. `@clerk/ui` installed. Build, tsc, eslint pass.

- 03-auth UI pass: 50/50 auth layout (left `bg-surface` panel with logo, headline, 3 feature rows, footer; right `bg-base`). Added ui-context tokens (`bg-base`, `bg-surface`, `text-copy-*`, `text-brand`, etc.) to globals.css; Clerk appearance now uses them and Geist Sans.

- 04-project-dialogs: `EditorHome` (heading, description, New Project), `ProjectDialogs` (create w/ live slug preview, rename w/ autofocus + Enter submit, delete w/ destructive confirm), `hooks/use-project-dialogs.ts` (dialog/form/loading state, mock list in memory), `lib/projects.ts` (mock data + `slugify`). Sidebar lists owned/shared projects; rename/delete shown only for owned; mobile backdrop scrim closes sidebar. tsc + eslint pass.

- 04-project-dialogs follow-ups: brand-teal (`bg-brand`) default and ghost buttons app-wide; new `dark` button variant for Cancel (black, teal on hover; Create/Rename turn black while Cancel is hovered); confirm button left, Cancel right; white dialog titles and input text; teal focus border/glow on inputs. Unicode-only names allowed: submit gate uses trimmed name, `toSlug()` falls back to `project`, preview notes the default, whitespace-only names show a validation message. `ClerkProvider` moved inside `<body>` (Cache Components compatibility). Build passes.

- 05-prisma: `prisma/models/project.prisma` (`Project`, `ProjectCollaborator`, `ProjectStatus` enum; indexes and cascade per spec); `lib/prisma.ts` cached singleton (Accelerate when `DATABASE_URL` starts with `prisma+postgres://`, else `@prisma/adapter-pg`; cached on `globalThis` outside production); `init` migration applied; client generated to `app/generated/prisma`. Added `@prisma/extension-accelerate` (not preinstalled). Build + tsc pass.

- 06-project-apis: `app/api/projects/route.ts` (GET list owned, POST create; name defaults to `Untitled Project`, ID via schema `cuid()`), `app/api/projects/[projectId]/route.ts` (PATCH rename, DELETE; owner-only). 401 unauthenticated, 403 non-owner, 404 missing project, 400 empty rename. `proxy.ts` skips `auth.protect()` for `/api/*` so handlers return 401 JSON instead of Clerk's redirect/404. Backend only.

- 07-wire-editor-home: `/editor` is a server component; `lib/project-data.ts` (`getProjectsForCurrentUser`: owned by Clerk ID, shared via collaborator email) feeds `EditorShell` (client) inside `<Suspense>`. `hooks/use-project-actions.ts` replaces the mock hook: create (short suffix + slug = room ID = project ID, `POST /api/projects`, push `/editor/[id]`), rename (`PATCH`, refresh), delete (`DELETE`, redirect to `/editor` if active workspace else refresh); API errors shown in dialogs. Create dialog previews Room ID. `POST /api/projects` now accepts an optional `id` (validated, 409 on duplicate) so project ID matches the room ID. Mock data removed from `lib/projects.ts`; `Project.slug` dropped. Build passes. Added placeholder `/editor/[projectId]` (owner/collaborator access check via `getAccessibleProject`, else 404) so create navigation lands on a real route; `EditorShell` takes optional `children` for main content.

- 08-editor-workspace-shell: route renamed `/editor/[projectId]` -> `/editor/[roomId]`; server component redirects signed-out users to `/sign-in` and renders `components/editor/access-denied.tsx` (lock icon, message, link to `/editor`) for missing or unauthorized projects. `lib/project-access.ts` holds `getCurrentIdentity` (userId + verified primary email) and `getProjectIfAccessible` (owner or collaborator); replaces `getAccessibleProject` in `project-data.ts`. `EditorShell` takes optional `workspace` ({id, name}): navbar shows project name, Share button (no behavior) and AI sidebar toggle; `ProjectSidebar` highlights the current room (`currentProjectId`); `WorkspaceCanvas` placeholder (dark bg, centered message) fills remaining space; right AI sidebar placeholder (hidden below `md`). Collaborator match now uses the primary verified email only (was all verified emails).

- 09-share-dialog: `components/editor/share-dialog.tsx` opened from the navbar Share button (wired in `EditorShell`); owners invite/remove by email and see the list, collaborators see a read-only list; Copy link shows `Copied!` for 2s. `app/api/projects/[projectId]/collaborators/route.ts` (GET list, POST invite, DELETE remove via JSON `{email}`); invite/remove are owner-only server-side (401/403/404, 400 invalid email, 409 duplicate). `lib/project-collaborators.ts`: `resolveProjectRole` and `listCollaborators`, which enriches emails with Clerk name/avatar via Backend API (`getUserList`), falling back to email only. Emails stored lowercased; no local user table.
- Foundation styling review follow-up: restored default/ghost Button and Input/Dialog foundation styles, removed the `dark` button variant, and moved brand and editor-dialog overrides into `components/editor/editor-styles.ts` (shared class constants, including `dark:` overrides since the app is always dark) used by app-level editor components.
- Review follow-ups: shared-project listing (`getProjectsForCurrentUser`) now uses `getCurrentIdentity` and matches the verified primary email only, same as workspace admission; navbar AI toggle hidden below `md` (AI panel is desktop-only); share dialog resets loading/error on every open via render-time prop tracking instead of `onOpenChange`; `listCollaborators` queries Clerk in chunks of 100 emails (parallel) so profile enrichment isn't truncated past 100 collaborators.

- 10-liveblocks-setup: `liveblocks.config.ts` augments the global `Liveblocks` types (Presence: `cursor` `{x,y} | null` + `isThinking`; UserMeta: `id` + `info` `{name, avatar, color}`). `lib/liveblocks.ts`: `getLiveblocks()` lazily creates a `@liveblocks/node` client cached on `globalThis` (throws if `LIVEBLOCKS_SECRET_KEY` is unset, so builds don't need it); `getUserColor()` maps a user ID to a fixed 12-color palette via FNV-1a. `POST /api/liveblocks-auth` reads `{ room }` (room ID = project ID; 400 if missing), requires Clerk auth (401), checks access with `getProjectIfAccessible` (403 for missing or inaccessible, so existence isn't leaked), `getOrCreateRoom` with `defaultAccesses: []` (private room; access only via token), then issues an access-token session with `*:write` on that room and userInfo name (full name, username, email, then `Anonymous`), avatar (Clerk image URL), and color. Installed `@liveblocks/node@^3.25.2` (it was not preinstalled, despite the spec).

- 11-base-canvas: `/editor/[roomId]` stays a server component and passes `roomId={project.id}` to `WorkspaceCanvas` (now a client component): `LiveblocksProvider` (`authEndpoint: /api/liveblocks-auth`) → `RoomProvider` (initial presence `{ cursor: null, isThinking: false }`; `isThinking` is required by the Presence type) → `CanvasErrorBoundary` (class boundary for thrown errors) → `RoomConnection` (`useErrorListener` swaps to the error state on `ROOM_CONNECTION_ERROR`, e.g. 403 from the auth route) → `ClientSideSuspense` ("Connecting to canvas…" spinner) → `CollaborativeCanvas`. `CollaborativeCanvas` uses `useLiveblocksFlow<CanvasNode, CanvasEdge>({ suspense: true })` with empty initial nodes/edges and passes nodes, edges, `onNodesChange`/`onEdgesChange`/`onConnect`/`onDelete` into `ReactFlow` (`ConnectionMode.Loose`, `fitView`, dark color mode, `bg-base`), with `MiniMap` and a dots `Background`, colored with CSS tokens. `types/canvas.ts`: `NODE_COLORS` (8 fill/text pairs from ui-context), `NODE_SHAPES` (6), defaults, `CANVAS_NODE_TYPE = "canvasNode"`, `CANVAS_EDGE_TYPE = "canvasEdge"`, `CanvasNodeData` (`label`, `color`, `shape`), `CanvasNode`, `CanvasEdge`. No controls, custom node/edge renderers, persistence, or AI. `CursorPosition` in `liveblocks.config.ts` changed from `interface` to a type alias (Liveblocks rejects interfaces in Presence as non-JSON).

- 12-shape-panel: `components/editor/shape-panel.tsx` is a floating pill toolbar (bottom-center) with draggable Lucide icon buttons for the 6 `NODE_SHAPES`. Drag sets `application/x-ghost-shape` to JSON `{ shape, size }`. `lib/shape-drag.ts` handles serialize/parse, and parse validates the shape and positive finite sizes. `types/canvas.ts` adds `NodeSize`, `DEFAULT_SHAPE_SIZES` (rectangle 160x80, diamond 180x120, circle 100x100, pill 160x60, cylinder 120x100, hexagon 160x90) and `isNodeShape`. `CollaborativeCanvas` now wraps a `ReactFlowProvider`. Its wrapper div handles `dragover` (only for the shape MIME) and `drop`: `screenToFlowPosition`, node centered on the cursor, ID `${shape}-${Date.now()}-${counter}` (per-component ref counter), type `canvasNode`, `width`/`height` from the payload, data `{ label: "", color: DEFAULT_NODE_COLOR, shape }`, added via `onNodesChange([{ type: "add" }])` so it syncs through Liveblocks. `components/editor/canvas-node.tsx` draws every shape as a bordered rounded rectangle with a centered label (fill/text from `data.color`, brand border when selected), registered as `nodeTypes.canvasNode`. No handles or shape-specific visuals yet.

- Fix (issues.md #2): `canvas-node.tsx` now renders per-shape visuals from `data.shape`: rectangle/circle/pill via CSS radius, diamond/hexagon/cylinder via an inline stretched SVG (non-scaling 1px stroke), with label padding kept inside the shape. Handles still pending.

- Fix (issues.md #3): workspace canvas is full-bleed (`absolute inset-0 bg-base`, no border/radius/padding; React Flow `Background` `bgColor` set to `--bg-base`). Project sidebar and new `components/editor/ai-sidebar.tsx` float over the canvas (absolute, `z-30`, translucent + shadow) and slide fully off-screen when closed (`translate` past the inset + `invisible` after the transition). `MiniMap` offsets by `--canvas-inset-right` while the AI panel is open. Build, tsc, eslint pass.

## In Progress

- None.

## Next Up

- `canvasNode` connection handles, custom `canvasEdge` renderer (smooth-step edges), canvas controls, live cursors, and AI chat inside the `/editor/[roomId]` workspace.

## Open Questions

- Slug uniqueness: fallback slug `project` (Unicode-only names) will collide once persistence exists; backend needs a suffix/ID strategy.

- Sign-in/up env vars were absent from `.env.local`; added Clerk-standard `NEXT_PUBLIC_CLERK_SIGN_IN_URL`/`SIGN_UP_URL` (+ fallback redirect URLs to `/editor`). Confirm Clerk dashboard matches.

- Installed `prisma`/`@prisma/client` are 6.19.3 while `@prisma/adapter-pg` is 7.10.1; works today, but align versions. Accelerate branch uses the v6 API (`datasourceUrl` + `withAccelerate()`), which differs from v7 (`accelerateUrl`).

- `LIVEBLOCKS_SECRET_KEY` is not in `.env.local`; add it (from the Liveblocks dashboard) before the auth route can issue tokens.

## Architecture Decisions

- Dark-only: `dark` class is hardcoded on `<html>`; shadcn `.dark` tokens in globals.css are the active theme. Custom ui-context tokens are now defined (added in 03-auth); 02-editor components use the existing shadcn tokens (`bg-background`, `border-border`, `bg-popover`, `text-muted-foreground`) instead.

## Session Notes

- Cache Components is on: `auth()` and Clerk client components need `<Suspense>`.
- `package.json` had `shadcn` at `^1.0.0` (broke build); restored `^4.23.0`.
- Sidebar sits at `top-14` to clear the 56px navbar.
- Liveblocks Presence/Storage types must be JSON-compatible: use `type` aliases, not `interface`, for objects nested in them.
- Clerk UI components return `null` until clerk-js loads, so inside streamed Suspense trees they can hydrate-mismatch; gate them with `hooks/use-is-hydrated.ts` (see `issues.md` #1).
