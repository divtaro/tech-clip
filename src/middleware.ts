import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const basicUser = process.env.BASIC_AUTH_USER
  const basicPassword = process.env.BASIC_AUTH_PASSWORD

  // Basic認証チェック（環境変数が設定されている場合のみ）
  if (basicUser && basicPassword) {
    // Cookie確認（認証済みセッション）
    const authCookie = request.cookies.get('basic-auth-verified')

    // すでに認証済みの場合はスキップ
    if (authCookie?.value === 'true') {
      return NextResponse.next()
    }

    const basicAuth = request.headers.get('authorization')

    if (!basicAuth) {
      return new NextResponse('Authentication required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Secure Area"',
        },
      })
    }

    try {
      const authValue = basicAuth.split(' ')[1]
      const [user, pwd] = atob(authValue).split(':')

      if (user !== basicUser || pwd !== basicPassword) {
        return new NextResponse('Invalid credentials', {
          status: 401,
          headers: {
            'WWW-Authenticate': 'Basic realm="Secure Area"',
          },
        })
      }

      // 認証成功時、Cookieをセット（永続的に保持）
      const response = NextResponse.next()
      response.cookies.set('basic-auth-verified', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365 * 10, // 10年間（実質永続的）
      })
      return response
    } catch (error) {
      return new NextResponse('Invalid credentials', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Secure Area"',
        },
      })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}
