import { notFound } from "next/navigation";
import { Suspense } from "react";

import { EditorShell } from "@/components/editor/editor-shell";
import { getAccessibleProject, getProjectsForCurrentUser } from "@/lib/project-data";

async function WorkspaceContent({ params }: PageProps<"/editor/[projectId]">) {
  const { projectId } = await params;
  const [project, { owned, shared }] = await Promise.all([
    getAccessibleProject(projectId),
    getProjectsForCurrentUser(),
  ]);
  if (!project) notFound();

  return (
    <EditorShell ownedProjects={owned} sharedProjects={shared}>
      <main className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
        <h1 className="text-2xl font-semibold text-foreground">{project.name}</h1>
        <p className="text-sm text-muted-foreground">
          Canvas workspace coming soon.
        </p>
      </main>
    </EditorShell>
  );
}

export default function WorkspacePage(props: PageProps<"/editor/[projectId]">) {
  return (
    <Suspense fallback={null}>
      <WorkspaceContent {...props} />
    </Suspense>
  );
}
