import { type EmailOtpType } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// The client you created from the Server-Side Auth instructions
import { createClientForServerComponent } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  let next = searchParams.get('next') ?? '/'
  const redirectTo = request.nextUrl.clone();

  // Handle next url parameter in case it holds the full path instead of just the route segment
  if(next.startsWith("http")) {
    const nextUrl = new URL(next);
    next = nextUrl.pathname;
  }

  redirectTo.pathname = next

  if (token_hash && type) {
    const supabase = await createClientForServerComponent()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      return NextResponse.redirect(redirectTo)
    }
  }

  // return the user to an error page with some instructions
  redirectTo.pathname = '/auth/auth-code-error';
  return NextResponse.redirect(redirectTo)
}