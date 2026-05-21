// app/api/pdfs/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";

const PAGE_SIZE = 10;

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;

    const query = searchParams.get("q") || "";
    const page = searchParams.get("page") || "1";
    const sort = searchParams.get("sort") || "date";
    const order = searchParams.get("order") || "desc";

    const currentPage = Math.max(Number(page) || 1, 1);

    const orderBy: Prisma.FileOrderByWithRelationInput =
      sort === "name"
        ? {
            name: order === "asc" ? "asc" : "desc",
          }
        : {
            createdAt: order === "asc" ? "asc" : "desc",
          };

          console.log(query, page, sort, order);
    const where = {
      userId,
      ...(query && {
        name: {
          contains: query,
          mode: "insensitive" as const,
        },
      }),
    };

    const totalCount = await db.file.count({
      where,
    });

    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    const pdfs = await db.file.findMany({
      where,
      orderBy,
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    });

    return NextResponse.json({
      pdfs,
      pagination: {
        totalCount,
        totalPages,
        currentPage,
        pageSize: PAGE_SIZE,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
