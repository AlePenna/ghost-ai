# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- 09-share-dialog: Share dialog in the workspace

## Current Goal

- Implement `context/feature-specs/09-share-dialog.md`. Done; build, tsc, eslint pass.

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

## In Progress

- None.

## Next Up

- Real canvas, Liveblocks, and AI chat inside the `/editor/[roomId]` workspace shell.

## Open Questions

- Slug uniqueness: fallback slug `project` (Unicode-only names) will collide once persistence exists; backend needs a suffix/ID strategy.

- Sign-in/up env vars were absent from `.env.local`; added Clerk-standard `NEXT_PUBLIC_CLERK_SIGN_IN_URL`/`SIGN_UP_URL` (+ fallback redirect URLs to `/editor`). Confirm Clerk dashboard matches.

- Installed `prisma`/`@prisma/client` are 6.19.3 while `@prisma/adapter-pg` is 7.10.1; works today, but align versions. Accelerate branch uses the v6 API (`datasourceUrl` + `withAccelerate()`), which differs from v7 (`accelerateUrl`).

## Architecture Decisions

- Dark-only: `dark` class is hardcoded on `<html>`; shadcn `.dark` tokens in globals.css are the active theme. Custom ui-context tokens are now defined (added in 03-auth); 02-editor components use the existing shadcn tokens (`bg-background`, `border-border`, `bg-popover`, `text-muted-foreground`) instead.

## Session Notes

- Cache Components is on: `auth()` and Clerk client components need `<Suspense>`.
- `package.json` had `shadcn` at `^1.0.0` (broke build); restored `^4.23.0`.
- Sidebar sits at `top-14` to clear the 56px navbar.
