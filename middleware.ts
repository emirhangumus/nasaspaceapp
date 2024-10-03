import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { CheckAuth } from "./lib/CheckAuth";

export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/board")) {
    return NextResponse.next();
  }

  try {
    await CheckAuth(undefined, request);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }
}
