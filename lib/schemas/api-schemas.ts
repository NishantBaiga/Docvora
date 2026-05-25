import { z } from "zod";

export const FileIdSchema = z.object({
  fileId: z.string().min(1, "fileId is required"),
});

export const GetFileQuerySchema = z.object({
  fileId: z.string().min(1, "fileId is required"),
});

export const GetFilesQuerySchema = z.object({
  q: z.string().optional().default(""),
  page: z.coerce.number().int().min(1).optional().default(1),
  sort: z.enum(["date", "name"]).optional().default("date"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const ChatPostSchema = z.object({
  fileId: z.string().min(1, "fileId is required"),
  question: z.string().min(1, "question is required").max(2000, "question too long"),
});

export const WorkspaceInitSchema = z.object({
  fileId: z.string().min(1, "fileId is required"),
});

export const DeleteDocumentSchema = z.object({
  fileId: z.string().min(1, "fileId is required"),
});