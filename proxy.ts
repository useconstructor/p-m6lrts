import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
export async function proxy(request: NextRequest) {
  const token = request.cookies.get('session')?.value
  if (!token) return NextResponse.redirect(new URL('/', request.url))
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? 'dev-secret-change-in-prod')
    const { payload } = await jwtVerify(token, secret)
    return payload.isAdmin ? NextResponse.next() : NextResponse.redirect(new URL('/', request.url))
  } catch { return NextResponse.redirect(new URL('/', request.url)) }
}
export const config = { matcher: ['/admin/:path*'] }
