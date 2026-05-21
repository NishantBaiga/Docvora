// app/workspace/page.tsx  ← empty state (no file selected)
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import WorkspaceLayout from "@/components/workspace/workspace-layout";

export default async function WorkspaceIndexPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  // Auto-redirect to most recent file if one exists
  const latest = await db.file.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  if (latest) redirect(`/workspace/${latest.id}`);

  return <WorkspaceLayout fileId={null} />;
}