import { currentUser } from "@clerk/nextjs/server";

import { getLiveblocks, getUserColor } from "@/lib/liveblocks";
import { getCurrentIdentity, getProjectIfAccessible } from "@/lib/project-access";

/** The Liveblocks client posts `{ room }`; the room ID is the project ID. */
async function readRoomId(request: Request): Promise<string | null> {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || !("room" in body)) return null;
    const room = (body as { room: unknown }).room;
    return typeof room === "string" && room.trim() ? room : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const roomId = await readRoomId(request);
  if (!roomId) {
    return Response.json({ error: "Missing room" }, { status: 400 });
  }

  const identity = await getCurrentIdentity();
  if (!identity) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Missing and inaccessible projects both get 403: don't reveal existence.
  const project = await getProjectIfAccessible(roomId, identity);
  if (!project) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const liveblocks = getLiveblocks();
  // Private room: access comes only from the session token issued below.
  await liveblocks.getOrCreateRoom(project.id, { defaultAccesses: [] });

  const user = await currentUser();
  const name =
    user?.fullName || user?.username || identity.email || "Anonymous";

  const session = liveblocks.prepareSession(identity.userId, {
    userInfo: {
      name,
      avatar: user?.imageUrl ?? "",
      color: getUserColor(identity.userId),
    },
  });
  session.allow(project.id, ["*:write"]);

  const { status, body } = await session.authorize();
  return new Response(body, {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
