"use client";

import type { FormEvent } from "react";

import { AppDialog } from "@/components/editor/app-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { useProjectDialogs } from "@/hooks/use-project-dialogs";

type ProjectDialogsProps = ReturnType<typeof useProjectDialogs>;

export function ProjectDialogs({
  dialog,
  name,
  setName,
  slug,
  usesFallbackSlug,
  error,
  canSubmit,
  isLoading,
  close,
  submitCreate,
  submitRename,
  submitDelete,
}: ProjectDialogsProps) {
  function handleSubmit(submit: () => void) {
    return (e: FormEvent) => {
      e.preventDefault();
      submit();
    };
  }

  const cancel = (
    <Button
      type="button"
      variant="dark"
      data-cancel
      onClick={close}
      disabled={isLoading}
    >
      Cancel
    </Button>
  );

  return (
    <>
      <AppDialog
        open={dialog.type === "create"}
        onOpenChange={(open) => !open && close()}
        title="Create Project"
        description="Give your new architecture workspace a name."
        footer={
          <>
            <Button
              type="submit"
              data-confirm
              form="create-project-form"
              disabled={!canSubmit}
            >
              {isLoading ? "Creating…" : "Create"}
            </Button>
            {cancel}
          </>
        }
      >
        <form
          id="create-project-form"
          onSubmit={handleSubmit(submitCreate)}
          className="flex flex-col gap-2"
        >
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name"
            aria-label="Project name"
          />
          <p className="text-xs text-muted-foreground">
            Slug: <span className="font-mono">{slug || "—"}</span>
            {usesFallbackSlug
              ? " (default — name has no Latin letters or digits)"
              : null}
          </p>
          {error ? (
            <p role="alert" className="text-xs text-destructive">
              {error}
            </p>
          ) : null}
        </form>
      </AppDialog>

      <AppDialog
        open={dialog.type === "rename"}
        onOpenChange={(open) => !open && close()}
        title="Rename Project"
        description={
          dialog.type === "rename"
            ? `Current name: ${dialog.project.name}`
            : undefined
        }
        footer={
          <>
            <Button
              type="submit"
              data-confirm
              form="rename-project-form"
              disabled={!canSubmit}
            >
              {isLoading ? "Renaming…" : "Rename"}
            </Button>
            {cancel}
          </>
        }
      >
        <form id="rename-project-form" onSubmit={handleSubmit(submitRename)}>
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name"
            aria-label="Project name"
            aria-invalid={error ? true : undefined}
          />
          {error ? (
            <p role="alert" className="mt-2 text-xs text-destructive">
              {error}
            </p>
          ) : null}
        </form>
      </AppDialog>

      <AppDialog
        open={dialog.type === "delete"}
        onOpenChange={(open) => !open && close()}
        title="Delete Project"
        description={
          dialog.type === "delete"
            ? `Are you sure you want to delete "${dialog.project.name}"? This action cannot be undone.`
            : undefined
        }
        footer={
          <>
            <Button
              type="button"
              variant="destructive"
              onClick={submitDelete}
              disabled={isLoading}
            >
              {isLoading ? "Deleting…" : "Delete"}
            </Button>
            {cancel}
          </>
        }
      />
    </>
  );
}
