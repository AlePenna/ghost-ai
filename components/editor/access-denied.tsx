import { Lock } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { brandButton } from "@/components/editor/editor-styles";

export function AccessDenied() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <Lock className="h-10 w-10 text-muted-foreground" />
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-foreground">Access denied</h1>
        <p className="text-sm text-muted-foreground">
          This project doesn&apos;t exist or you don&apos;t have access to it.
        </p>
      </div>
      <Button
        className={brandButton}
        render={<Link href="/editor" />}
        nativeButton={false}
      >
        Back to editor
      </Button>
    </main>
  );
}
