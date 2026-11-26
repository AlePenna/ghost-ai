"use client";

import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
  useErrorListener,
} from "@liveblocks/react/suspense";
import { Loader2, TriangleAlert } from "lucide-react";
import { useState, type ReactNode } from "react";

import { CanvasErrorBoundary } from "@/components/editor/canvas-error-boundary";
import { CollaborativeCanvas } from "@/components/editor/collaborative-canvas";

interface WorkspaceCanvasProps {
  /** Liveblocks room ID (same as the project ID). */
  roomId: string;
}

/** Sets up the Liveblocks room for a project and renders its shared canvas. */
export function WorkspaceCanvas({ roomId }: WorkspaceCanvasProps) {
  return (
    <main className="absolute inset-0 overflow-hidden bg-base">
      <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
        <RoomProvider
          id={roomId}
          initialPresence={{ cursor: null, isThinking: false }}
        >
          <CanvasErrorBoundary fallback={<CanvasError />}>
            <RoomConnection>
              <ClientSideSuspense fallback={<CanvasLoading />}>
                <CollaborativeCanvas />
              </ClientSideSuspense>
            </RoomConnection>
          </CanvasErrorBoundary>
        </RoomProvider>
      </LiveblocksProvider>
    </main>
  );
}

/** Swaps to the error state when the room connection fails (e.g. auth denied). */
function RoomConnection({ children }: { children: ReactNode }) {
  const [hasError, setHasError] = useState(false);
  useErrorListener((error) => {
    if (error.context.type === "ROOM_CONNECTION_ERROR") setHasError(true);
  });
  return hasError ? <CanvasError /> : children;
}

function CanvasLoading() {
  return (
    <div className="flex h-full items-center justify-center gap-2 text-sm text-copy-muted">
      <Loader2 className="h-4 w-4 animate-spin" />
      Connecting to canvas…
    </div>
  );
}

function CanvasError() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
      <TriangleAlert className="h-6 w-6 text-copy-muted" />
      <p className="text-sm font-medium text-copy-primary">
        Couldn&apos;t connect to this canvas.
      </p>
      <p className="text-sm text-copy-muted">
        Check your connection and reload the page to try again.
      </p>
    </div>
  );
}
