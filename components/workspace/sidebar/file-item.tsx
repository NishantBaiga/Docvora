import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useWorkspace } from "@/hooks/use-workspace";
import { FileRecord } from "@/types/type.pdf";
import { formatDistanceToNow } from "date-fns";
import { Ellipsis, FileText, Loader2, Trash2 } from "lucide-react";

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

    const {
      processingStatus,
    } = useWorkspace(file.id);

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
        {processingStatus === "PROCESSING" && (
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