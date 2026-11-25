"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import {
  generateSuffix,
  slugify,
  toRoomId,
  toSlug,
  type Project,
} from "@/lib/projects";

export type ProjectDialogState =
  | { type: "closed" }
  | { type: "create" }
  | { type: "rename"; project: Project }
  | { type: "delete"; project: Project };

async function request(url: string, init: RequestInit): Promise<void> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "Something went wrong. Please try again.");
  }
}

/** Manages dialog state, form state, and project mutations via the API. */
export function useProjectActions() {
  const router = useRouter();
  const pathname = usePathname();
  const [dialog, setDialog] = useState<ProjectDialogState>({ type: "closed" });
  const [name, setName] = useState("");
  const [suffix, setSuffix] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const slug = toSlug(name);
  const usesFallbackSlug = slug !== "" && slugify(name) === "";
  const roomId = slug ? toRoomId(name, suffix) : "";
  const validationError =
    name.length > 0 && name.trim() === "" ? "Project name is required." : null;
  const error = validationError ?? apiError;
  const canSubmit = name.trim().length > 0 && !isLoading;

  function openCreate() {
    setName("");
    setSuffix(generateSuffix());
    setApiError(null);
    setDialog({ type: "create" });
  }

  function openRename(project: Project) {
    setName(project.name);
    setApiError(null);
    setDialog({ type: "rename", project });
  }

  function openDelete(project: Project) {
    setName("");
    setApiError(null);
    setDialog({ type: "delete", project });
  }

  function close() {
    if (isLoading) return;
    setDialog({ type: "closed" });
  }

  function changeName(value: string) {
    setApiError(null);
    setName(value);
  }

  async function run(action: () => Promise<void>) {
    setIsLoading(true);
    setApiError(null);
    try {
      await action();
      setDialog({ type: "closed" });
    } catch (e) {
      setApiError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  function submitCreate() {
    if (dialog.type !== "create" || !canSubmit) return;
    const id = toRoomId(name, suffix);
    const projectName = name.trim();
    return run(async () => {
      await request("/api/projects", {
        method: "POST",
        body: JSON.stringify({ id, name: projectName }),
      });
      router.push(`/editor/${id}`);
      router.refresh();
    });
  }

  function submitRename() {
    if (dialog.type !== "rename" || !canSubmit) return;
    const { id } = dialog.project;
    const projectName = name.trim();
    return run(async () => {
      await request(`/api/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: projectName }),
      });
      router.refresh();
    });
  }

  function submitDelete() {
    if (dialog.type !== "delete" || isLoading) return;
    const { id } = dialog.project;
    return run(async () => {
      await request(`/api/projects/${id}`, { method: "DELETE" });
      if (pathname === `/editor/${id}`) {
        router.push("/editor");
      }
      router.refresh();
    });
  }

  return {
    dialog,
    name,
    setName: changeName,
    slug,
    roomId,
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
