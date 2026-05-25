// app/workspace/[fileId]/error.tsx
"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function WorkspaceError({ error, reset }: Props) {
  useEffect(() => {
    console.error("Workspace error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-3 text-center px-6">
      <div className="p-3 bg-destructive/10 rounded-full">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">Failed to load workspace</p>
        <p className="text-xs text-muted-foreground">
          {error.message || "An unexpected error occurred"}
        </p>
      </div>
      <Button size="sm" variant="outline" onClick={reset}>
        <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
        Try again
      </Button>
    </div>
  );
}