// Liveblocks type augmentation: shapes realtime presence and user metadata
// for every room hook and the server-side session token.

/**
 * Pointer position in canvas coordinates. A type alias, not an interface:
 * Liveblocks requires Presence to be JSON-compatible, and interfaces lack the
 * implicit index signature that check relies on.
 */
export type CursorPosition = {
  x: number;
  y: number;
};

declare global {
  interface Liveblocks {
    Presence: {
      /** Null when the pointer is outside the canvas. */
      cursor: CursorPosition | null;
      /** True while this user's AI request is running. */
      isThinking: boolean;
    };

    UserMeta: {
      /** Clerk user ID. */
      id: string;
      info: {
        name: string;
        avatar: string;
        /** Cursor color, derived from the user ID. */
        color: string;
      };
    };
  }
}
