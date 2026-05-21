"use client";

import {
  FileText,
  Ellipsis,
  Menu,
  Search,
  Plus,
  Loader2,
  Trash2,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { useEffect, useMemo, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import UploadSheet from "../upload/upload-sheet";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow, isToday, isThisWeek } from "date-fns";
import { FileRecord } from "@/types/type.pdf";
import { useRouter } from "next/navigation";
import { useDeleteDocument } from "@/hooks/useDeleteFile";

interface WorkspaceSidebarProps {
  fileId: string | null;
  files: FileRecord[];
  loadingFiles: boolean;
  onNavigate?: () => void;
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
}: WorkspaceSidebarProps) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { handleDelete, deletingId } = useDeleteDocument();
  const router = useRouter();

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // Filter
  const filteredFiles = useMemo(() => {
    if (!debouncedSearch.trim()) return files;
    return files.filter((file) =>
      file.name.toLowerCase().includes(debouncedSearch.toLowerCase()),
    );
  }, [files, debouncedSearch]);

  // Group
  const groups = useMemo(
    () => groupFiles(filteredFiles ?? []),
    [filteredFiles],
  );

  // Navigate
  function navigate(id: string) {
    router.push(`/workspace/${id}`);
    onNavigate?.();
  }

  console.log(search);
  console.log("filteredFiles in sidebar component", files);
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
          <Input
            placeholder="Search PDFs…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs bg-muted/50 border-0 focus-visible:ring-1"
          />
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
            {search ? "No PDFs found" : "No PDFs uploaded yet"}
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
                      onDelete={() => handleDelete(file.id)}
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
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <UserButton />
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-medium">nishant</span>
            <span className="text-xs text-muted-foreground">
              nishantbaiga@gmail.com
            </span>
          </div>
        </div>
      </SidebarFooter>
      <UploadSheet open={uploadOpen} onOpenChange={setUploadOpen} />
    </Sidebar>
  );
}

export function FileItem({
  file,
  isActive,
  isDeleting,
  onSelect,
  onDelete,
}: {
  file: FileRecord;
  isActive: boolean;
  isDeleting: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
}) {
  return (
    <SidebarMenuItem className="relative group/item">
      <SidebarMenuButton
        onClick={onSelect}
        isActive={isActive}
        className="pr-8 h-auto py-2"
      >
        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="truncate text-sm font-medium leading-tight">
            {file?.name}
          </span>
          <span className="text-[10px] text-muted-foreground leading-tight mt-0.5">
            {formatDistanceToNow(new Date(file?.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
        {file?.uploadStatus === "PROCESSING" && (
          <Loader2 className="h-3 w-3 shrink-0 animate-spin text-muted-foreground" />
        )}
      </SidebarMenuButton>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-md
                       flex items-center justify-center text-muted-foreground
                       hover:bg-muted opacity-0 group-hover/item:opacity-100 transition-opacity"
          >
            <Ellipsis className="h-3.5 w-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuItem
            className="text-destructive focus:text-destructive gap-2"
            onClick={onDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}

// need refresh imporvement when deleting file
