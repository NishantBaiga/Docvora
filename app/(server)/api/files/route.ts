// app/api/pdfs/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";
import { withErrorHandler } from "@/lib/api-handler";
import { Errors } from "@/lib/errors";
import { GetFilesQuerySchema } from "@/lib/schemas/api-schemas";

const PAGE_SIZE = 10;
export const GET = withErrorHandler(async (req: Request) => {
  const { userId } = await auth();
  if (!userId) throw Errors.unauthorized();

  const nextReq = req as NextRequest;
  const { searchParams } = nextReq.nextUrl;

  const { q, page, sort, order } = GetFilesQuerySchema.parse({
    q: searchParams.get("q") ?? "",
    page: searchParams.get("page") ?? "1",
    sort: searchParams.get("sort") ?? "date",
    order: searchParams.get("order") ?? "desc",
  });

  const orderBy: Prisma.FileOrderByWithRelationInput =
    sort === "name"
      ? { name: order }
      : { createdAt: order };

  const where: Prisma.FileWhereInput = {
    userId,
    ...(q && {
      name: {
        contains: q,
        mode: "insensitive",
      },
    }),
  };

  const totalCount = await db.file.count({ where });
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const pdfs = await db.file.findMany({
    where,
    orderBy,
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return NextResponse.json({
    pdfs,
    pagination: {
      totalCount,
      totalPages,
      currentPage: page,
      pageSize: PAGE_SIZE,
    },
  });
});