import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { CheckAuth } from "./lib/CheckAuth";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/board")) {
    return NextResponse.next();
  }

  /**
   * Todo: Add your middleware logic here
   *
   */
  try {
    await CheckAuth(undefined, request);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }
}

// See "Matching Paths" below to learn more
// export const config = {
//   matcher: ["/*"],
// };
