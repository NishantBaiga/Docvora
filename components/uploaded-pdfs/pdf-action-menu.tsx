"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { MoreVertical, Pencil, Trash } from "lucide-react";
import { updateDocumentName } from "@/app/(server)/actions/updateDocumentName";
import { DeleteDocument } from "@/app/(server)/actions/deleteDocument";


type Props = {
  fileId: string;
  currentName: string;
};

export function PdfActionsMenu({ fileId, currentName }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [newName, setNewName] = useState(currentName);

  function handleRename() {
    if (!newName.trim() || newName === currentName) {
      setRenameOpen(false);
      return;
    }

    startTransition(async () => {
      await updateDocumentName(fileId, newName);
      setRenameOpen(false);
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await DeleteDocument(fileId);
      setDeleteOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      {/* ⋮ Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            disabled={isPending}
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setRenameOpen(true)}>
            <Pencil className="w-4 h-4 mr-2" />
            Rename
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ✏️ Rename Dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename PDF</DialogTitle>
          </DialogHeader>

          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Enter new file name"
            autoFocus
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenameOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={isPending}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 🗑️ Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete this PDF?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The PDF and all related data
              will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
