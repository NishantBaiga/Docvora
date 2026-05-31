import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { PdfActionsMenu } from "@/components/uploaded-pdfs/pdf-action-menu";
import { SearchInput } from "@/components/uploaded-pdfs/search-input";
import { HighlightText } from "@/components/uploaded-pdfs/highlight-text";
import { Prisma } from "../../../lib/generated/prisma/client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { SortSelect } from "@/components/uploaded-pdfs/sort-select";

const PAGE_SIZE = 9;
export default async function PdfListingPage({
  searchParams,
}: {
  searchParams?: Promise<{
    q?: string;
    page?: string;
    sort?: string;
    order?: string;
  }>;
}) {
  const { userId } = await auth();
  if (!userId) return null;

  const {
    q: query = "",
    page = "1",
    sort = "date",
    order = "desc",
  } = (await searchParams) ?? {};

  const currentPage = Math.max(Number(page) || 1, 1);

  const orderBy: Prisma.FileOrderByWithRelationInput =
    sort === "name"
      ? { name: order === "asc" ? "asc" : "desc" }
      : { createdAt: order === "asc" ? "asc" : "desc" };

  const totalCount = await db.file.count({
    where: {
      userId,
      ...(query && {
        name: {
          contains: query,
          mode: "insensitive",
        },
      }),
    },
  });

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const pdfs = await db.file.findMany({
    where: {
      userId,
      ...(query && {
        name: {
          contains: query,
          mode: "insensitive",
        },
      }),
    },
    orderBy,
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  console.log("pdfs", pdfs);
  return (
    <section className="py-20 md:py-28 max-w-5xl mx-auto px-4">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-10">
        Your <span className="text-orange-600">Uploaded PDFs</span>
      </h1>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-10">
        <div className="w-full sm:max-w-md">
          <SearchInput />
        </div>

        <SortSelect />
      </div>

      {/* EMPTY STATES */}
      {pdfs.length === 0 && !query && (
        <div className="text-center py-20">
          <p className="text-lg mb-6">No PDFs uploaded yet.</p>
          <Link href="/upload">
            <Button size="lg">
              Upload Your First PDF
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      )}

      {pdfs.length === 0 && query && (
        <div className="text-center mt-20">
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
            No PDFs found
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Try searching with a different name.
          </p>
        </div>
      )}

      {/* PDF LIST */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-10">
        {pdfs.map((pdf) => (
          <div
            key={pdf.id}
            className="relative p-5 rounded-2xl border border-gray-200 dark:border-gray-800
                 bg-white dark:bg-gray-900 shadow-sm hover:shadow-xl
                 transition-all duration-300"
          >
            {/* ⋮ Actions Menu */}
            <div className="absolute top-3 right-3 z-10">
              <PdfActionsMenu fileId={pdf.id} currentName={pdf.name} />
            </div>

            {/* Icon */}
            <FileText className="w-10 h-10 text-orange-600 mb-4" />

            {/* Clickable Name */}
            <Link
              href={`/workspace/${pdf.id}`}
              className="block font-semibold text-lg text-gray-900 dark:text-white
                   hover:text-orange-600 hover:underline transition-colors duration-200 truncate"
            >
              <HighlightText text={pdf.name} query={query} />
            </Link>

            {/* Meta */}
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              {pdf.size
                ? pdf.size < 1024
                  ? `${Math.round(pdf.size)} B`
                  : pdf.size < 1048576
                    ? `${Math.round(pdf.size / 1024)} KB`
                    : `${Math.round(pdf.size / 1048576)} MB`
                : "Unknown size"}
            </p>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Uploaded on {new Date(pdf.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="mt-14 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={`?q=${query}&sort=${sort}&order=${order}&page=${currentPage - 1}`}
                  aria-disabled={currentPage === 1}
                  className={
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>
              <span className="p-1">{totalCount}</span>

              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNumber = i + 1;
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href={`?q=${query}&sort=${sort}&order=${order}&page=${pageNumber}`}
                      isActive={pageNumber === currentPage}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  href={`?q=${query}&sort=${sort}&order=${order}&page=${currentPage + 1}`}
                  aria-disabled={currentPage === totalPages}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </section>
  );
}
