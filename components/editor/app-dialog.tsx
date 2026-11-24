"use client";

import type { ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** Dialog body, rendered between the header and the footer. */
  children?: ReactNode;
  /** Footer actions, e.g. Cancel / Confirm buttons. */
  footer?: ReactNode;
}

/**
 * Shared dialog pattern: title, description, optional body, footer actions.
 * Styled with the globals.css tokens (popover / border / muted).
 */
export function AppDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: AppDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-3xl border border-border bg-popover text-popover-foreground backdrop-blur-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        {children}
        {footer ? (
          <DialogFooter className="rounded-b-3xl border-border has-[[data-cancel]:hover]:[&_[data-confirm]]:bg-black has-[[data-cancel]:hover]:[&_[data-confirm]]:text-white">
            {footer}
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
