Read `AGENTS.md` before starting.

We're adding the design system and UI primitive compontents.

Install and configure `shadcn/ui`.

Add the shadcn compontents:
- Button
- Card
- Dialog
- Input
- Tabs
- Textarea
- ScrollArea

Do not modify the generated `compontents/ui/*` files after installation.

Also Install `lucide-react`.

Create 'lib/utils.ts' with a reusable `cn()` helper for merging Tailwind classes.

Ensure all compontents match the existing dark theme in `globals.css`.

### Check when done
- All compontents import without errors
- `cn()` works properly
- no default light styling appears 