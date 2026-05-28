// components/workspace/upload/upload-sheet.tsx
"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import UploadDropzone from "./upload-dropzone";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onRefetch?: () => void;
}

export default function UploadSheet({ open, onOpenChange, onRefetch }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-auto rounded-t-2xl pb-8">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-base">Upload a PDF</SheetTitle>
        </SheetHeader>
        <UploadDropzone
          onSuccess={() => onOpenChange(false)}
          onRefetch={onRefetch}
        />
      </SheetContent>
    </Sheet>
  );
}
