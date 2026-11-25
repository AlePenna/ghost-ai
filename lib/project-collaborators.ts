import "server-only";

import { clerkClient } from "@clerk/nextjs/server";

import { getCurrentIdentity, type CurrentIdentity } from "@/lib/project-access";
import { prisma } from "@/lib/prisma";

export interface Collaborator {
  email: string;
  name: string | null;
  imageUrl: string | null;
}

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
    const { data: users } = await client.users.getUserList({
      emailAddress: rows.map((r) => r.email),
      limit: 100,
    });
    for (const user of users) {
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
