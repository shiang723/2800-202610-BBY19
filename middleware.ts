import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClientForServerComponent } from "./lib/supabase/server";

export async function middleware(request: NextRequest) {
  const supabase = await createClientForServerComponent();
  const data = await supabase.auth.getUser();
  const user = data?.data?.user;

  if (request.nextUrl.pathname.startsWith("/profile") && !user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (
    (request.nextUrl.pathname.startsWith("/login") ||
      request.nextUrl.pathname.startsWith("/signup")) &&
    user
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }
}
