"use client";

import { Menu, Search, Plus } from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import { useEffect, useMemo, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarGroup,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import UploadSheet from "../upload/upload-sheet";
import { motion, AnimatePresence } from "framer-motion";
import { isToday, isThisWeek } from "date-fns";
import { FileRecord } from "@/types/type.pdf";
import { useRouter } from "next/navigation";
import { useDeleteDocument } from "@/hooks/useDeleteFile";
import { FileItem } from "./file-item";
import SidebarFooterUser from "./sidebar-footer";
import SearchDialog from "./search-dialog";

interface WorkspaceSidebarProps {
  fileId: string | null;
  files: FileRecord[];
  loadingFiles: boolean;
  onNavigate?: () => void;
  onRefetch?: () => void;
}

type Group = { label: string; files: FileRecord[] };

function groupFiles(files: FileRecord[]): Group[] {
  const today: FileRecord[] = [];
  const thisWeek: FileRecord[] = [];
  const older: FileRecord[] = [];

  for (const f of files) {
    const d = new Date(f.createdAt);
    if (isToday(d)) today.push(f);
    else if (isThisWeek(d)) thisWeek.push(f);
    else older.push(f);
  }

  return [
    { label: "Today", files: today },
    { label: "This week", files: thisWeek },
    { label: "Older", files: older },
  ].filter((g) => g.files.length > 0);
}

export default function WorkspaceSidebar({
  fileId,
  files,
  loadingFiles,
  onNavigate,
  onRefetch,
}: WorkspaceSidebarProps) {
  const router = useRouter();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { handleDelete, deletingId } = useDeleteDocument(onRefetch, files);


  // Group
 const groups = useMemo(() => groupFiles(files ?? []), [files]);


  useEffect(() => {
  function handleKeyDown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setSearchOpen(true);
    }
  }
  document.addEventListener("keydown", handleKeyDown);
  return () => document.removeEventListener("keydown", handleKeyDown);
}, []);

  // Navigate
  function navigate(id: string) {
    router.push(`/workspace/${id}`);
    onNavigate?.();
  }

  return (
    <Sidebar collapsible="icon">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className=" text-lg font-semibold transition-opacity group-data-[state=collapsed]:hidden ">
            <span className="text-lg font-semibold tracking-tight">logo</span>
          </div>

          {/* Collapse trigger */}
          <SidebarTrigger>
            <Menu className="h-5 w-5" />
          </SidebarTrigger>
        </div>
      </div>

      <SidebarHeader className="px-3 py-3 gap-3">
        {/* Logo + New Upload button */}
        <div className="flex items-center justify-between group-data-[state=collapsed]:justify-center">
          <span className="text-sm font-semibold tracking-tight group-data-[state=collapsed]:hidden">
            PDF Chat
          </span>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 gap-1.5 group-data-[state=collapsed]:h-8 group-data-[state=collapsed]:w-8 group-data-[state=collapsed]:p-0"
            onClick={() => setUploadOpen(true)}
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span className="group-data-[state=collapsed]:hidden">
              New upload
            </span>
          </Button>
        </div>

        {/* Search */}
        <div className="relative group-data-[state=collapsed]:hidden">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 w-full h-8 px-2.5 rounded-md
             bg-muted/50 hover:bg-muted text-muted-foreground
             text-xs transition-colors group-data-[collapsible=icon]:hidden"
          >
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span className="text-xs">Search PDFs…</span>
            <kbd
              className="ml-auto text-[10px] px-1 py-0.5 rounded bg-background
                  border font-mono hidden sm:inline-block"
            >
              ⌘ K
            </kbd>
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          Projects
        </SidebarGroup>
        {loadingFiles ? (
          <div className="space-y-2 p-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-md border p-3"
              >
                <div className="h-4 w-4 rounded bg-muted animate-pulse" />

                <div className="flex-1 space-y-2">
                  <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
                  <div className="h-2 w-1/3 rounded bg-muted animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : files?.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            {"No PDFs uploaded yet"}
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {groups?.map((group) => (
              <motion.div
                key={group?.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-2 group-data-[state=collapsed]:hidden"
              >
                <div className="px-2 py-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  {group?.label}
                </div>
                <SidebarMenu>
                  {group.files.map((file) => (
                    <FileItem
                      key={file.id}
                      file={file}
                      isActive={fileId === file.id}
                      isDeleting={deletingId === file.id}
                      onSelect={() => navigate(file.id)}
                      onDelete={() =>
                        handleDelete(file.id, fileId ?? undefined)
                      }
                    />
                  ))}
                </SidebarMenu>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="px-3 py-3 border-t">
        <SidebarFooterUser />
      </SidebarFooter>

      
      <UploadSheet open={uploadOpen} onOpenChange={setUploadOpen}  onRefetch={onRefetch} />
      <SearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onNavigate={onNavigate}
      />
    </Sidebar>
  );
}
