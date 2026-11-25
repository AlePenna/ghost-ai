import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

async function authorize(projectId: string) {
  const { userId } = await auth();
  if (!userId) {
    return {
      error: Response.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });
  if (!project) {
    return { error: Response.json({ error: "Not found" }, { status: 404 }) };
  }
  if (project.ownerId !== userId) {
    return { error: Response.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { error: null };
}

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/projects/[projectId]">,
) {
  const { projectId } = await ctx.params;
  const { error } = await authorize(projectId);
  if (error) return error;

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    // handled below
  }

  const rawName =
    body && typeof body === "object" && "name" in body
      ? (body as { name: unknown }).name
      : undefined;
  if (typeof rawName !== "string" || !rawName.trim()) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }

  const project = await prisma.project.update({
    where: { id: projectId },
    data: { name: rawName.trim() },
  });

  return Response.json({ project });
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/projects/[projectId]">,
) {
  const { projectId } = await ctx.params;
  const { error } = await authorize(projectId);
  if (error) return error;

  await prisma.project.delete({ where: { id: projectId } });

  return Response.json({ success: true });
}
