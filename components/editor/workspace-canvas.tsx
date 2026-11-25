import { Compass } from "lucide-react";

export function WorkspaceCanvas() {
  return (
    <main className="relative flex min-w-0 flex-1 items-center justify-center overflow-hidden rounded-2xl border border-border bg-[#0b0b0f] px-6 text-center">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-[radial-gradient(ellipse_at_top,rgba(45,212,191,0.08),transparent_70%)]"
      />
      <div className="relative flex max-w-xl flex-col items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-background/60">
          <Compass className="h-8 w-8 text-brand" />
        </div>
        <p className="text-xs font-medium tracking-[0.25em] text-muted-foreground uppercase">
          Workspace Shell
        </p>
        <h2 className="text-3xl font-semibold text-foreground">
          Canvas and collaboration tooling land here next.
        </h2>
        <p className="text-sm leading-7 text-muted-foreground">
          This room is ready for the shared architecture canvas, durable AI
          workflows, and real-time presence. For now, the shell is wired with
          project context and navigation only.
        </p>
      </div>
    </main>
  );
}
