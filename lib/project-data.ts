import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";
import type { Project } from "@/lib/projects";

/** Owned and shared projects for the signed-in user. */
export async function getProjectsForCurrentUser(): Promise<{
  owned: Project[];
  shared: Project[];
}> {
  const { userId } = await auth();
  if (!userId) return { owned: [], shared: [] };

  const user = await currentUser();
  const emails = (user?.emailAddresses ?? []).map((e) => e.emailAddress);

  const [owned, shared] = await Promise.all([
    prisma.project.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true },
    }),
    emails.length === 0
      ? Promise.resolve([])
      : prisma.project.findMany({
          where: {
            ownerId: { not: userId },
            collaborators: {
              some: {
                OR: emails.map((email) => ({
                  email: { equals: email, mode: "insensitive" as const },
                })),
              },
            },
          },
          orderBy: { createdAt: "desc" },
          select: { id: true, name: true },
        }),
  ]);

  return {
    owned: owned.map((p) => ({ ...p, isOwner: true })),
    shared: shared.map((p) => ({ ...p, isOwner: false })),
  };
}

/** The project if the current user owns it or is a collaborator; otherwise null. */
export async function getAccessibleProject(
  projectId: string,
): Promise<{ id: string; name: string } | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  const emails = (user?.emailAddresses ?? []).map((e) => e.emailAddress);

  return prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: userId },
        ...emails.map((email) => ({
          collaborators: {
            some: { email: { equals: email, mode: "insensitive" as const } },
          },
        })),
      ],
    },
    select: { id: true, name: true },
  });
}
