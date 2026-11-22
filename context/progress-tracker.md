# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- 02-editor: editor chrome (navbar, project sidebar shell, dialog pattern)

## Current Goal

- Implement `context/feature-specs/02-editor.md`: `EditorNavbar`, `ProjectSidebar`, and a reusable dialog pattern (no real dialogs yet).

## Completed

- 01-design-system: shadcn/ui (base-nova) configured; Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea added; lucide-react installed; `lib/utils.ts` exports `cn()`; `dark` class applied on `<html>`; font vars fixed in globals.css. tsc + build pass.
- 02-editor: `components/editor/editor-navbar.tsx` (props: `isSidebarOpen`, `onToggleSidebar`), `project-sidebar.tsx` (props: `isOpen`, `onClose?`, `onNewProject?`; fixed overlay, slides in, doesn't push content), `app-dialog.tsx` (title/description/body/footer pattern; no dialogs instantiated). tsc + eslint pass.

## In Progress

- None.

## Next Up

- Wire navbar + sidebar into the editor route (owns `isOpen` state) once the route exists.

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- Dark-only: `dark` class is hardcoded on `<html>`; shadcn `.dark` tokens in globals.css are the active theme. Custom tokens from ui-context.md (`bg-base`, etc.) are not yet defined; 02-editor components use the existing shadcn tokens (`bg-background`, `border-border`, `bg-popover`, `text-muted-foreground`) instead.

## Session Notes

- Components are not yet mounted on any route. Sidebar sits at `top-14` to clear the 56px navbar.
