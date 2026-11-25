import { Suspense } from "react";

import { EditorShell } from "@/components/editor/editor-shell";
import { getProjectsForCurrentUser } from "@/lib/project-data";

async function EditorContent() {
  const { owned, shared } = await getProjectsForCurrentUser();
  return <EditorShell ownedProjects={owned} sharedProjects={shared} />;
}

export default function EditorPage() {
  return (
    <Suspense fallback={null}>
      <EditorContent />
    </Suspense>
  );
}
