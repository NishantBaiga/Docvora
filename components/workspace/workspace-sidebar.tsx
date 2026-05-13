"use client";

import { FileText, Ellipsis, Menu } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
} from "../ui/dropdown-menu";
import { usePdfs } from "@/hooks/use-get-pdfs";

interface WorkspaceSidebarProps {
  fileId?: string;
  onUpload?: () => void;
}

export default function WorkspaceSidebar({
  fileId,
  onUpload,
}: WorkspaceSidebarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const { files, loading } = usePdfs();

  console.log("files in sidebar component", files);

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleFileClick = (id: string) => {
    router.push(`/workspace/${id}`);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 border-b">
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
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          Projects
        </SidebarGroup>

        <SidebarMenu className="p-2 group-data-[collapsible=icon]:hidden">
          {filteredFiles.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              {searchQuery ? "No PDFs found" : "No PDFs uploaded yet"}
            </div>
          ) : (
            filteredFiles.map((file) => (
              <SidebarMenuItem key={file.id} className="relative group/item">
                {/* FILE ROW */}
                <SidebarMenuButton
                  onClick={() => handleFileClick(file.id)}
                  isActive={fileId === file.id}
                  className="w-full justify-start pr-10"
                >
                  <FileText className="mr-2 h-4 w-4 shrink-0" />
                  <div className="flex-1 overflow-hidden">
                    <div className="truncate font-medium">{file.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {new Date(file.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </SidebarMenuButton>

                {/* DROPDOWN TRIGGER */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground       hover:bg-muted hover:text-foreground opacity-0 group-hover/item:opacity-100 group-data-[collapsible=icon]:hidden"
                    >
                      <Ellipsis className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Rename</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-500">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            ))
          )}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="px-4 py-2 border-t">
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
    </Sidebar>
  );
}
