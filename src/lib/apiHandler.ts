import { NextResponse } from "next/server";

type Handler = (req: Request, ctx?: unknown) => Promise<NextResponse>;

/**
 * Wraps an API route handler with top-level error handling.
 * Prevents unhandled exceptions from crashing the route with a 500.
 */
export function withErrorHandling(handler: Handler): Handler {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Internal server error";
      console.error("[api] Unhandled error:", message, err);
      return NextResponse.json({ error: message }, { status: 500 });
    }
  };
}
