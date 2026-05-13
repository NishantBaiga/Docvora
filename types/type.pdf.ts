export interface PdfFile {
  id: string;
  name: string;
  createdAt: string;
}

export interface GetPdfsResponse {
  pdfs: PdfFile[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}