"use client";

import { Check, Copy, Loader2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";

import { AppDialog } from "@/components/editor/app-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { brandButton, brandGhostButton, brandInput } from "@/components/editor/editor-styles";

interface Collaborator {
  email: string;
  name: string | null;
  imageUrl: string | null;
}

interface CollaboratorsResponse {
  role: "owner" | "collaborator";
  collaborators: Collaborator[];
  error?: string;
}

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

export function ShareDialog({ open, onOpenChange, projectId }: ShareDialogProps) {
  const endpoint = `/api/projects/${projectId}/collaborators`;
  const [role, setRole] = useState<"owner" | "collaborator" | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [prevOpen, setPrevOpen] = useState(open);

  // Reset request state on every open, however the dialog was opened.
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setIsLoading(true);
      setError(null);
    }
  }

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetch(endpoint)
      .then(async (res) => {
        const data = (await res.json()) as CollaboratorsResponse;
        if (!res.ok) throw new Error(data.error ?? "Failed to load");
        if (cancelled) return;
        setRole(data.role);
        setCollaborators(data.collaborators);
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, endpoint]);

  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    [],
  );

  const mutate = useCallback(
    async (method: "POST" | "DELETE", target: string) => {
      setIsBusy(true);
      setError(null);
      try {
        const res = await fetch(endpoint, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: target }),
        });
        const data = (await res.json()) as CollaboratorsResponse;
        if (!res.ok) throw new Error(data.error ?? "Request failed");
        setCollaborators(data.collaborators);
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Request failed");
        return false;
      } finally {
        setIsBusy(false);
      }
    },
    [endpoint],
  );

  async function handleInvite(event: FormEvent) {
    event.preventDefault();
    const value = email.trim();
    if (!value) return;
    if (await mutate("POST", value)) setEmail("");
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/editor/${projectId}`,
      );
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy the link");
    }
  }

  const isOwner = role === "owner";

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Share project"
      description={
        role === "collaborator"
          ? "You have view-only access to this project's collaborator list."
          : "Invite collaborators by email. They must sign in with that address."
      }
      footer={
        <Button variant="outline" onClick={handleCopy}>
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {copied ? "Copied!" : "Copy link"}
        </Button>
      }
    >
      {isOwner ? (
        <form onSubmit={handleInvite} className="flex gap-2">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            aria-label="Collaborator email"
            disabled={isBusy}
            className={brandInput}
          />
          <Button
            type="submit"
            className={brandButton}
            disabled={isBusy || !email.trim()}
          >
            Invite
          </Button>
        </form>
      ) : null}

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-1">
        <h3 className="text-xs tracking-wide text-muted-foreground uppercase">
          Collaborators
        </h3>
        {isLoading ? (
          <Loader2 className="my-4 h-4 w-4 animate-spin text-muted-foreground" />
        ) : collaborators.length === 0 ? (
          <p className="py-2 text-sm text-muted-foreground">
            No collaborators yet.
          </p>
        ) : (
          <ul className="flex flex-col">
            {collaborators.map((c) => (
              <li key={c.email} className="flex items-center gap-3 py-2">
                {c.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.imageUrl}
                    alt=""
                    className="h-8 w-8 shrink-0 rounded-full"
                  />
                ) : (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs uppercase">
                    {c.email[0]}
                  </span>
                )}
                <div className="min-w-0 flex-1 leading-tight">
                  {c.name ? (
                    <p className="truncate text-sm text-foreground">{c.name}</p>
                  ) : null}
                  <p
                    className={
                      c.name
                        ? "truncate text-xs text-muted-foreground"
                        : "truncate text-sm text-foreground"
                    }
                  >
                    {c.email}
                  </p>
                </div>
                {isOwner ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className={brandGhostButton}
                    disabled={isBusy}
                    onClick={() => mutate("DELETE", c.email)}
                    aria-label={`Remove ${c.email}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppDialog>
  );
}
