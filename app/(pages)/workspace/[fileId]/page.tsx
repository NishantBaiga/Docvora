"use client";

import { useParams } from "next/navigation";
import { useWorkspace } from "@/hooks/use-workspace";
import { useMessages } from "@/hooks/use-messages";
import { usePdf } from "@/hooks/use-pdf";
import ChatSection from "@/components/workspace/chat-section";
import WorkspaceSidebar from "@/components/workspace/workspace-sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";

export default function WorkSpacePage() {
  const params = useParams();
  const fileId = params?.fileId as string;
  const { summary, loading } = useWorkspace(fileId);
  const { messages, sending, loadingMessages, sendMessage } =
    useMessages(fileId);
  const { pdfUrl, loadingPdf, downloadPdf } = usePdf(fileId);

  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState("chat");

  

  const handleUpload = () => {
    // Implement upload logic
    console.log("Upload clicked");
  };

  return (
    <>
      {/* ================= MOBILE VIEW ================= */}
      <div className="lg:hidden relative h-screen bg-gray-100 dark:bg-gray-900 flex">
        {/* Sidebar */}
        <WorkspaceSidebar
          fileId={fileId}
          // files={mockFiles}
          onUpload={handleUpload}
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
            <ChatSection
              fileId={fileId}
              summary={summary}
              loading={loading || loadingMessages}
              messages={messages}
              sending={sending}
              input={input}
              setInput={setInput}
              sendMessage={() => sendMessage(input)}
              isMobile
            />
          </TabsContent>

          <TabsContent value="preview" className="flex-1 m-0">
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
          </TabsContent>
        </Tabs>
      </div>

      {/* ================= DESKTOP VIEW (UNCHANGED) ================= */}
      <div className="hidden lg:flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
        {/* Sidebar */}
        <WorkspaceSidebar
          fileId={fileId}
          onUpload={handleUpload}
        />
        {/* Main Content */}
        <div className="flex-1 ">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={45} minSize={0}>
              {/* <div className="h-full p-4 bg-gray-200 dark:bg-gray-800"> */}
              <div className="h-full p-4  bg-white dark:bg-gray-900 rounded-lg overflow-hidden ">
                {loadingPdf ? (
                  <div className="flex items-center justify-center h-full">
                    Loading PDF...
                  </div>
                ) : (
                  pdfUrl && <iframe src={pdfUrl} className="w-full h-full" />
                )}
              </div>
              {/* </div> */}
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={55} minSize={10}>
              <ChatSection
                fileId={fileId}
                summary={summary}
                loading={loading || loadingMessages}
                messages={messages}
                sending={sending}
                input={input}
                setInput={setInput}
                sendMessage={() => sendMessage(input)}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </>
  );
}
