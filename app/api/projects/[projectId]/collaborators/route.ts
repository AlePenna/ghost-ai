import { listCollaborators, resolveProjectRole } from "@/lib/project-collaborators";
import { prisma } from "@/lib/prisma";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  return email.length <= 254 && EMAIL_PATTERN.test(email) ? email : null;
}

async function readEmail(request: Request): Promise<string | null> {
  try {
    const body: unknown = await request.json();
    return body && typeof body === "object" && "email" in body
      ? parseEmail((body as { email: unknown }).email)
      : null;
  } catch {
    return null;
  }
}

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/projects/[projectId]/collaborators">,
) {
  const { projectId } = await ctx.params;
  const access = await resolveProjectRole(projectId);
  if (!access.ok) return access.response;

  const collaborators = await listCollaborators(projectId);
  return Response.json({ role: access.role, collaborators });
}

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/projects/[projectId]/collaborators">,
) {
  const { projectId } = await ctx.params;
  const access = await resolveProjectRole(projectId);
  if (!access.ok) return access.response;
  if (access.role !== "owner") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const email = await readEmail(request);
  if (!email) {
    return Response.json({ error: "A valid email is required" }, { status: 400 });
  }
  if (email === access.identity.email?.toLowerCase()) {
    return Response.json(
      { error: "You already own this project" },
      { status: 400 },
    );
  }

  const existing = await prisma.projectCollaborator.findFirst({
    where: { projectId, email: { equals: email, mode: "insensitive" } },
    select: { id: true },
  });
  if (existing) {
    return Response.json(
      { error: "Already a collaborator" },
      { status: 409 },
    );
  }

  await prisma.projectCollaborator.create({ data: { projectId, email } });
  const collaborators = await listCollaborators(projectId);
  return Response.json({ role: access.role, collaborators }, { status: 201 });
}

export async function DELETE(
  request: Request,
  ctx: RouteContext<"/api/projects/[projectId]/collaborators">,
) {
  const { projectId } = await ctx.params;
  const access = await resolveProjectRole(projectId);
  if (!access.ok) return access.response;
  if (access.role !== "owner") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const email = await readEmail(request);
  if (!email) {
    return Response.json({ error: "A valid email is required" }, { status: 400 });
  }

  await prisma.projectCollaborator.deleteMany({
    where: { projectId, email: { equals: email, mode: "insensitive" } },
  });
  const collaborators = await listCollaborators(projectId);
  return Response.json({ role: access.role, collaborators });
}
