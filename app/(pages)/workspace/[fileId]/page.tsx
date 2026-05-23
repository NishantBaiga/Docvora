// app/workspace/[fileId]/page.tsx
import { redirect } from "next/navigation";
import { auth} from "@clerk/nextjs/server";
import WorkspaceLayout from "@/components/workspace/workspace-layout";
import { db } from "@/lib/db";
interface Props {
  params: Promise<{ fileId: string }>;
}

export default async function WorkspacePage({ params }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { fileId } = await params;

  // Verify file exists and belongs to user
  const file = await db.file.findUnique({
    where: { id: fileId },
  });

  // If file does not exist or belongs to someone else redirect to empty workspace
  if (!file || file.userId !== userId) {
    redirect("/workspace");
  }
  return <WorkspaceLayout fileId={fileId} />;
}
