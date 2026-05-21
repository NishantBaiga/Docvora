// app/workspace/[fileId]/page.tsx
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import WorkspaceLayout from "@/components/workspace/workspace-layout";

interface Props {
  params: Promise<{ fileId: string }>;
}

export default async function WorkspacePage({ params }: Props) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const { fileId } = await params;
  return <WorkspaceLayout fileId={fileId} />;
}