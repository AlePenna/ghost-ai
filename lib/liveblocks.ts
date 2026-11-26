import "server-only";

import { Liveblocks } from "@liveblocks/node";

const globalForLiveblocks = globalThis as unknown as {
  liveblocks?: Liveblocks;
};

/**
 * Cached Liveblocks node client. Created on first use so builds don't need
 * the secret; reused across requests and dev hot reloads.
 */
export function getLiveblocks(): Liveblocks {
  if (globalForLiveblocks.liveblocks) return globalForLiveblocks.liveblocks;

  const secret = process.env.LIVEBLOCKS_SECRET_KEY;
  if (!secret) {
    throw new Error("LIVEBLOCKS_SECRET_KEY is not set");
  }

  const client = new Liveblocks({ secret });
  globalForLiveblocks.liveblocks = client;
  return client;
}

const CURSOR_COLORS = [
  "#E57373",
  "#F06292",
  "#BA68C8",
  "#9575CD",
  "#7986CB",
  "#64B5F6",
  "#4DD0E1",
  "#4DB6AC",
  "#81C784",
  "#DCE775",
  "#FFD54F",
  "#FF8A65",
] as const;

/** Same user ID always maps to the same palette color (FNV-1a hash). */
export function getUserColor(userId: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < userId.length; i++) {
    hash ^= userId.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return CURSOR_COLORS[(hash >>> 0) % CURSOR_COLORS.length];
}
