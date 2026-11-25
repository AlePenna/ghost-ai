import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

export interface CurrentIdentity {
  userId: string;
  /** Primary email, only when verified; unverified addresses are untrusted. */
  email: string | null;
}

/** Current Clerk identity (`userId` + primary email), or null if signed out. */
export async function getCurrentIdentity(): Promise<CurrentIdentity | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  const primary = user?.primaryEmailAddress;
  const email =
    primary?.verification?.status === "verified" ? primary.emailAddress : null;

  return { userId, email };
}

/** The project if the identity owns it or is a collaborator; otherwise null. */
export async function getProjectIfAccessible(
  projectId: string,
  identity: CurrentIdentity,
): Promise<{ id: string; name: string } | null> {
  return prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: identity.userId },
        ...(identity.email
          ? [
              {
                collaborators: {
                  some: {
                    email: {
                      equals: identity.email,
                      mode: "insensitive" as const,
                    },
                  },
                },
              },
            ]
          : []),
      ],
    },
    select: { id: true, name: true },
  });
}
