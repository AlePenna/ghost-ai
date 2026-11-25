import "server-only";

import { getCurrentIdentity } from "@/lib/project-access";
import { prisma } from "@/lib/prisma";
import type { Project } from "@/lib/projects";

/**
 * Owned and shared projects for the signed-in user. Shared projects match the
 * verified primary email only, the same rule as workspace admission
 * (`getProjectIfAccessible`), so listing and access always agree.
 */
export async function getProjectsForCurrentUser(): Promise<{
  owned: Project[];
  shared: Project[];
}> {
  const identity = await getCurrentIdentity();
  if (!identity) return { owned: [], shared: [] };
  const { userId, email } = identity;

  const [owned, shared] = await Promise.all([
    prisma.project.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true },
    }),
    email
      ? prisma.project.findMany({
          where: {
            ownerId: { not: userId },
            collaborators: {
              some: { email: { equals: email, mode: "insensitive" as const } },
            },
          },
          orderBy: { createdAt: "desc" },
          select: { id: true, name: true },
        })
      : Promise.resolve([]),
  ]);

  return {
    owned: owned.map((p) => ({ ...p, isOwner: true })),
    shared: shared.map((p) => ({ ...p, isOwner: false })),
  };
}
