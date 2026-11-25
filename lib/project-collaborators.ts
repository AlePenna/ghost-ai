import "server-only";

import { clerkClient } from "@clerk/nextjs/server";

import { getCurrentIdentity, type CurrentIdentity } from "@/lib/project-access";
import { prisma } from "@/lib/prisma";

export interface Collaborator {
  email: string;
  name: string | null;
  imageUrl: string | null;
}

const CLERK_PAGE_SIZE = 100;

export type ProjectRole = "owner" | "collaborator";

export type AccessResult =
  | { ok: true; role: ProjectRole; identity: CurrentIdentity }
  | { ok: false; response: Response };

/** Resolve the caller's role on a project; owner or collaborator only. */
export async function resolveProjectRole(
  projectId: string,
): Promise<AccessResult> {
  const identity = await getCurrentIdentity();
  if (!identity) {
    return {
      ok: false,
      response: Response.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });
  if (!project) {
    return {
      ok: false,
      response: Response.json({ error: "Not found" }, { status: 404 }),
    };
  }
  if (project.ownerId === identity.userId) {
    return { ok: true, role: "owner", identity };
  }

  const membership = identity.email
    ? await prisma.projectCollaborator.findFirst({
        where: {
          projectId,
          email: { equals: identity.email, mode: "insensitive" },
        },
        select: { id: true },
      })
    : null;
  if (!membership) {
    return {
      ok: false,
      response: Response.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { ok: true, role: "collaborator", identity };
}

/** Collaborators for a project, enriched with Clerk name/avatar when found. */
export async function listCollaborators(
  projectId: string,
): Promise<Collaborator[]> {
  const rows = await prisma.projectCollaborator.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
    select: { email: true },
  });
  if (rows.length === 0) return [];

  const profiles = new Map<string, { name: string | null; imageUrl: string }>();
  try {
    const client = await clerkClient();
    // Chunk to the page size: each chunk returns at most one user per email,
    // so no page is truncated, and query strings stay short.
    const emails = rows.map((r) => r.email);
    const chunks = Array.from(
      { length: Math.ceil(emails.length / CLERK_PAGE_SIZE) },
      (_, i) => emails.slice(i * CLERK_PAGE_SIZE, (i + 1) * CLERK_PAGE_SIZE),
    );
    const results = await Promise.all(
      chunks.map((emailAddress) =>
        client.users.getUserList({ emailAddress, limit: CLERK_PAGE_SIZE }),
      ),
    );
    for (const user of results.flatMap((r) => r.data)) {
      const name =
        [user.firstName, user.lastName].filter(Boolean).join(" ") || null;
      for (const address of user.emailAddresses) {
        profiles.set(address.emailAddress.toLowerCase(), {
          name,
          imageUrl: user.imageUrl,
        });
      }
    }
  } catch {
    // Clerk unavailable: fall back to showing emails only.
  }

  return rows.map(({ email }) => {
    const profile = profiles.get(email.toLowerCase());
    return {
      email,
      name: profile?.name ?? null,
      imageUrl: profile?.imageUrl ?? null,
    };
  });
}
