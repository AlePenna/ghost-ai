import { redirect } from "next/navigation";
import { Suspense } from "react";

import { AccessDenied } from "@/components/editor/access-denied";
import { EditorShell } from "@/components/editor/editor-shell";
import { WorkspaceCanvas } from "@/components/editor/workspace-canvas";
import { getCurrentIdentity, getProjectIfAccessible } from "@/lib/project-access";
import { getProjectsForCurrentUser } from "@/lib/project-data";

async function WorkspaceContent({ params }: PageProps<"/editor/[roomId]">) {
  const { roomId } = await params;

  const identity = await getCurrentIdentity();
  if (!identity) redirect("/sign-in");

  const [project, { owned, shared }] = await Promise.all([
    getProjectIfAccessible(roomId, identity),
    getProjectsForCurrentUser(),
  ]);
  if (!project) return <AccessDenied />;

  return (
    <EditorShell
      ownedProjects={owned}
      sharedProjects={shared}
      workspace={{ id: project.id, name: project.name }}
    >
      <WorkspaceCanvas roomId={project.id} />
    </EditorShell>
  );
}

export default function WorkspacePage(props: PageProps<"/editor/[roomId]">) {
  return (
    <Suspense fallback={null}>
      <WorkspaceContent {...props} />
    </Suspense>
  );
}
