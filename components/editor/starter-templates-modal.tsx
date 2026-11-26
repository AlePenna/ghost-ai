"use client";

import { Download } from "lucide-react";

import { brandButton } from "@/components/editor/editor-styles";
import {
  CANVAS_TEMPLATES,
  type CanvasTemplate,
} from "@/components/editor/starter-templates";
import { TemplatePreview } from "@/components/editor/template-preview";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface StarterTemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the chosen template; the modal closes right after. */
  onImport: (template: CanvasTemplate) => void;
}

/** Dialog listing the starter templates as preview cards with an import action. */
export function StarterTemplatesModal({
  open,
  onOpenChange,
  onImport,
}: StarterTemplatesModalProps) {
  const handleImport = (template: CanvasTemplate) => {
    onImport(template);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] grid-rows-[auto_minmax(0,1fr)] rounded-3xl border border-border bg-popover text-popover-foreground backdrop-blur-md sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">Starter templates</DialogTitle>
          <DialogDescription>
            Start from a pre-built diagram. Importing replaces everything on the
            current canvas.
          </DialogDescription>
        </DialogHeader>
        <div className="-mx-1 grid min-h-0 grid-cols-1 gap-3 overflow-y-auto px-1 pb-1 sm:grid-cols-2 lg:grid-cols-3">
          {CANVAS_TEMPLATES.map((template) => (
            <article
              key={template.id}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-3"
            >
              <TemplatePreview template={template} />
              <div className="flex flex-1 flex-col gap-1">
                <h3 className="text-sm font-medium text-copy-primary">
                  {template.name}
                </h3>
                <p className="text-xs text-copy-muted">{template.description}</p>
              </div>
              <Button
                size="sm"
                className={brandButton}
                onClick={() => handleImport(template)}
              >
                <Download className="h-4 w-4" />
                Import
              </Button>
            </article>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
