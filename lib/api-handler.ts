import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "./errors";

type RouteHandler = (req: Request | NextRequest, context?: unknown) => Promise<Response>;

export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (req: Request | NextRequest, context?: unknown) => {
    try {
      return await handler(req, context);
    } catch (err) {
      if (err instanceof ZodError) {
        const messages = err.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
        return NextResponse.json(
          {
            error: "Validation failed",
            code: "BAD_REQUEST",
            details: messages,
          },
          { status: 400 }
        );
      }

      if (err instanceof AppError) {
        return NextResponse.json(
          {
            error: err.message,
            code: err.code,
          },
          { status: err.statusCode }
        );
      }

      console.error("Unhandled route error:", err);
      return NextResponse.json(
        {
          error: "Something went wrong",
          code: "INTERNAL_SERVER_ERROR",
        },
        { status: 500 }
      );
    }
  };
}

