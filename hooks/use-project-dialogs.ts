"use client";

import { useState } from "react";

import { MOCK_PROJECTS, slugify, toSlug, type Project } from "@/lib/projects";

export type ProjectDialogState =
  | { type: "closed" }
  | { type: "create" }
  | { type: "rename"; project: Project }
  | { type: "delete"; project: Project };

const MOCK_LATENCY_MS = 400;

/** Manages project list (mock), dialog state, form state, and loading state. */
export function useProjectDialogs() {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [dialog, setDialog] = useState<ProjectDialogState>({ type: "closed" });
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const slug = toSlug(name);
  const usesFallbackSlug = slug !== "" && slugify(name) === "";
  const error =
    name.length > 0 && name.trim() === "" ? "Project name is required." : null;
  const canSubmit = name.trim().length > 0 && !isLoading;

  function openCreate() {
    setName("");
    setDialog({ type: "create" });
  }

  function openRename(project: Project) {
    setName(project.name);
    setDialog({ type: "rename", project });
  }

  function openDelete(project: Project) {
    setDialog({ type: "delete", project });
  }

  function close() {
    if (isLoading) return;
    setDialog({ type: "closed" });
  }

  function run(apply: () => void) {
    setIsLoading(true);
    setTimeout(() => {
      apply();
      setIsLoading(false);
      setDialog({ type: "closed" });
    }, MOCK_LATENCY_MS);
  }

  function submitCreate() {
    if (dialog.type !== "create" || !canSubmit) return;
    const projectName = name.trim();
    run(() =>
      setProjects((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          name: projectName,
          slug: toSlug(projectName),
          isOwner: true,
        },
      ]),
    );
  }

  function submitRename() {
    if (dialog.type !== "rename" || !canSubmit) return;
    const { id } = dialog.project;
    const projectName = name.trim();
    run(() =>
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, name: projectName } : p)),
      ),
    );
  }

  function submitDelete() {
    if (dialog.type !== "delete" || isLoading) return;
    const { id } = dialog.project;
    run(() => setProjects((prev) => prev.filter((p) => p.id !== id)));
  }

  return {
    ownedProjects: projects.filter((p) => p.isOwner),
    sharedProjects: projects.filter((p) => !p.isOwner),
    dialog,
    name,
    setName,
    slug,
    usesFallbackSlug,
    error,
    canSubmit,
    isLoading,
    openCreate,
    openRename,
    openDelete,
    close,
    submitCreate,
    submitRename,
    submitDelete,
  };
}
