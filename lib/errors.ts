export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code ?? httpCodeToString(statusCode);
  }
}

function httpCodeToString(code: number): string {
  const map: Record<number, string> = {
    400: "BAD_REQUEST",
    401: "UNAUTHORIZED",
    403: "FORBIDDEN",
    404: "NOT_FOUND",
    409: "CONFLICT",
    422: "UNPROCESSABLE_ENTITY",
    429: "TOO_MANY_REQUESTS",
    500: "INTERNAL_SERVER_ERROR",
  };
  return map[code] ?? "UNKNOWN_ERROR";
}

// Typed error factories — use these everywhere instead of new AppError directly
export const Errors = {
  unauthorized: () => new AppError("Unauthorized", 401),
  forbidden: () => new AppError("Forbidden", 403),
  notFound: (resource = "Resource") =>
    new AppError(`${resource} not found`, 404),
  badRequest: (message: string) => new AppError(message, 400),
  conflict: (message: string) => new AppError(message, 409),
  internal: (message = "Internal server error") =>
    new AppError(message, 500),
};