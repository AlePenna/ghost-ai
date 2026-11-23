import { FileText, Share2, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

const features = [
  {
    icon: Sparkles,
    title: "AI Architecture Generation",
    text: "Describe your system, AI maps it to nodes and edges on a live canvas.",
  },
  {
    icon: Share2,
    title: "Real-time Collaboration",
    text: "Live cursors, presence indicators, and shared node editing across your team.",
  },
  {
    icon: FileText,
    title: "Instant Spec Generation",
    text: "Export a complete Markdown technical spec directly from the canvas graph.",
  },
];

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-screen bg-base font-sans text-copy-primary lg:grid-cols-2">
      <section className="hidden flex-col justify-between border-r border-surface-border bg-surface p-10 lg:flex">
        <div className="flex items-center gap-3 font-semibold">
          <span className="h-9 w-9 rounded-xl bg-brand" aria-hidden />
          Ghost AI
        </div>

        <div className="max-w-md space-y-10">
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight">
              Design systems at the speed of thought.
            </h1>
            <p className="text-copy-muted">
              Describe your architecture in plain English. Ghost AI maps it to
              a shared canvas your whole team can refine in real time.
            </p>
          </div>
          <ul className="space-y-6">
            {features.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-surface-border bg-accent-dim text-brand">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-copy-secondary">
                    {title}
                  </p>
                  <p className="text-sm text-copy-muted">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-copy-faint">
          © 2026 Ghost AI. All rights reserved.
        </p>
      </section>
      <section className="flex items-center justify-center p-6">
        {children}
      </section>
    </main>
  );
}
