import type { UploadStatus as FileStatus } from "../lib/generated/prisma/client";

export interface FileRecord {
  id: string;
  name: string;
  size: number;  
  createdAt: string;
  uploadStatus: FileStatus;
}

export interface GetPdfsResponse {
  pdfs: FileRecord[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}
