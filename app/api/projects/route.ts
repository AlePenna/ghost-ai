import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

const DEFAULT_NAME = "Untitled Project";
const ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,99}$/;

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ projects });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    // Empty or invalid body: fall back to the default name.
  }

  const rawName =
    body && typeof body === "object" && "name" in body
      ? (body as { name: unknown }).name
      : undefined;
  const name =
    typeof rawName === "string" && rawName.trim() ? rawName.trim() : DEFAULT_NAME;

  // Optional client-supplied ID keeps the project ID aligned with its
  // Liveblocks room ID. Falls back to the schema's cuid() when absent.
  const rawId =
    body && typeof body === "object" && "id" in body
      ? (body as { id: unknown }).id
      : undefined;
  if (rawId !== undefined && (typeof rawId !== "string" || !ID_PATTERN.test(rawId))) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const project = await prisma.project.create({
      data: { ...(rawId ? { id: rawId } : {}), ownerId: userId, name },
    });
    return Response.json({ project }, { status: 201 });
  } catch (e) {
    if (e instanceof Error && "code" in e && e.code === "P2002") {
      return Response.json({ error: "ID already exists" }, { status: 409 });
    }
    throw e;
  }
}
