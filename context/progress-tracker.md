# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- 04-project-dialogs: editor home and project dialogs (mock data)

## Current Goal

- Implement `context/feature-specs/04-project-dialogs.md`. Done; awaiting manual verification.

## Completed

- 01-design-system: shadcn/ui (base-nova) configured; Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea added; lucide-react installed; `lib/utils.ts` exports `cn()`; `dark` class applied on `<html>`; font vars fixed in globals.css. tsc + build pass.
- 02-editor: `components/editor/editor-navbar.tsx` (props: `isSidebarOpen`, `onToggleSidebar`), `project-sidebar.tsx` (props: `isOpen`, `onClose?`, `onNewProject?`; fixed overlay, slides in, doesn't push content), `app-dialog.tsx` (title/description/body/footer pattern; no dialogs instantiated). tsc + eslint pass.

- 03-auth: `ClerkProvider` (dark theme + CSS-variable appearance in `lib/clerk-appearance.ts`) in root layout; `/sign-in` and `/sign-up` pages with two-panel `AuthShell`; `proxy.ts` protects all but sign-in/up paths (read from env vars); `/` redirects to `/editor` or `/sign-in`; `UserButton` in navbar; minimal `/editor` route mounts navbar + sidebar. `@clerk/ui` installed. Build, tsc, eslint pass.

- 03-auth UI pass: 50/50 auth layout (left `bg-surface` panel with logo, headline, 3 feature rows, footer; right `bg-base`). Added ui-context tokens (`bg-base`, `bg-surface`, `text-copy-*`, `text-brand`, etc.) to globals.css; Clerk appearance now uses them and Geist Sans.

- 04-project-dialogs: `EditorHome` (heading, description, New Project), `ProjectDialogs` (create w/ live slug preview, rename w/ autofocus + Enter submit, delete w/ destructive confirm), `hooks/use-project-dialogs.ts` (dialog/form/loading state, mock list in memory), `lib/projects.ts` (mock data + `slugify`). Sidebar lists owned/shared projects; rename/delete shown only for owned; mobile backdrop scrim closes sidebar. tsc + eslint pass.

## In Progress

- None.

## Next Up

- Editor canvas and projects (next feature spec).

## Open Questions

- Sign-in/up env vars were absent from `.env.local`; added Clerk-standard `NEXT_PUBLIC_CLERK_SIGN_IN_URL`/`SIGN_UP_URL` (+ fallback redirect URLs to `/editor`). Confirm Clerk dashboard matches.

## Architecture Decisions

- Dark-only: `dark` class is hardcoded on `<html>`; shadcn `.dark` tokens in globals.css are the active theme. Custom ui-context tokens are now defined (added in 03-auth); 02-editor components use the existing shadcn tokens (`bg-background`, `border-border`, `bg-popover`, `text-muted-foreground`) instead.

## Session Notes

- Cache Components is on: `auth()` and Clerk client components need `<Suspense>`.
- `package.json` had `shadcn` at `^1.0.0` (broke build); restored `^4.23.0`.
- Sidebar sits at `top-14` to clear the 56px navbar.
