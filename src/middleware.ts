import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const basicUser = process.env.BASIC_AUTH_USER
  const basicPassword = process.env.BASIC_AUTH_PASSWORD

  // 1. Basic認証チェック（環境変数が設定されている場合のみ）
  if (basicUser && basicPassword) {
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
    } catch (error) {
      return new NextResponse('Invalid credentials', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Secure Area"',
        },
      })
    }
  }

  // 2. Basic認証通過後、NextAuth.jsのセッションチェック
  const session = await auth()

  // /dashboardへのアクセスでセッションがない場合はログインページへ
  if (request.nextUrl.pathname.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
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
