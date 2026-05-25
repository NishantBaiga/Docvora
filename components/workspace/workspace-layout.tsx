"use client";
import { usePdf } from "@/hooks/use-file";
import WorkspaceSidebar from "@/components/workspace/sidebar/workspace-sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useState } from "react";
import EmptyState from "@/components/workspace/upload/upload-empty-state";
import { useFiles } from "@/hooks/use-files";
import ChatShell from "./chat/chat-shell";
import ErrorBoundary from "../common/error-boundary";

interface props {
  fileId: string | null;
}
export default function WorkspaceLayout({ fileId }: props) {
  const { pdfUrl, loadingPdf } = usePdf(fileId);
  const { files, loadingFiles, refetch } = useFiles();

  const [activeTab, setActiveTab] = useState("chat");

  const hasFiles = pdfUrl !== null;
  const showEmptyState = !fileId && !hasFiles;

  return (
    <>
      {/* ================= MOBILE VIEW ================= */}
      <div className="lg:hidden relative h-screen bg-gray-100 dark:bg-gray-900 flex">
        {/* Sidebar */}
        <WorkspaceSidebar
          fileId={fileId}
          files={files}
          loadingFiles={loadingFiles}
          onRefetch={refetch}
        />

        {/* Main Content */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col gap-0"
        >
          {/* Top Bar with Hamburger and Tabs */}
          <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-950 border-b">
            <SidebarTrigger>
              <Button size="icon" variant="ghost">
                <Menu className="h-5 w-5" />
              </Button>
            </SidebarTrigger>

            <TabsList className="h-9">
              <TabsTrigger value="chat" className="text-xs">
                Chat
              </TabsTrigger>
              <TabsTrigger value="preview" className="text-xs">
                Preview
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tabs Content */}
          <TabsContent value="chat" className="flex-1 m-0">
            <ErrorBoundary>
              <ChatShell fileId={fileId} />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="preview" className="flex-1 m-0">
            <ErrorBoundary>
              <div className="h-full w-full bg-white dark:bg-gray-900">
                {loadingPdf ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-sm text-gray-500">Loading PDF...</div>
                  </div>
                ) : pdfUrl ? (
                  <iframe src={pdfUrl} className="w-full h-full border-0" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-sm text-gray-500">No PDF loaded</div>
                  </div>
                )}
              </div>
            </ErrorBoundary>
          </TabsContent>
        </Tabs>
      </div>

      {/* ================= DESKTOP VIEW (UNCHANGED) ================= */}
      <div className="hidden lg:flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
        {/* Sidebar */}
        <WorkspaceSidebar
          fileId={fileId}
          files={files}
          loadingFiles={loadingFiles}
          onRefetch={refetch}
        />

        {/* Main Content */}
        <main className="flex-1 ">
          {showEmptyState ? (
            <EmptyState />
          ) : (
            <ResizablePanelGroup direction="horizontal" className="h-full">
              <ResizablePanel defaultSize={45} minSize={0}>
                <ErrorBoundary>
                  <div className="h-full p-4  bg-white dark:bg-gray-900 rounded-lg overflow-hidden ">
                    {loadingPdf ? (
                      <div className="flex items-center justify-center h-full">
                        Loading PDF...
                      </div>
                    ) : (
                      pdfUrl && (
                        <iframe src={pdfUrl} className="w-full h-full" />
                      )
                    )}
                  </div>
                </ErrorBoundary>{" "}
              </ResizablePanel>

              <ResizableHandle withHandle />

              <ResizablePanel defaultSize={55} minSize={10}>
                <ErrorBoundary>
                  <ChatShell fileId={fileId} />
                </ErrorBoundary>{" "}
              </ResizablePanel>
            </ResizablePanelGroup>
          )}
        </main>
      </div>
    </>
  );
}

// sidebar provider ko layout se WorkspaceLayout me use karna hai
