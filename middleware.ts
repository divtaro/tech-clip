import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export default auth((request) => {
  // Basic認証チェック（環境変数が設定されている場合のみ）
  if (process.env.BASIC_AUTH_USER && process.env.BASIC_AUTH_PASSWORD) {
    const basicAuth = request.headers.get('authorization')

    // Basic認証ヘッダーがない場合
    if (!basicAuth) {
      return new NextResponse('Authentication required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Secure Area"',
        },
      })
    }

    // 認証情報を検証
    const authValue = basicAuth.split(' ')[1]
    const [user, pwd] = atob(authValue).split(':')

    if (
      user !== process.env.BASIC_AUTH_USER ||
      pwd !== process.env.BASIC_AUTH_PASSWORD
    ) {
      return new NextResponse('Invalid credentials', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Secure Area"',
        },
      })
    }
  }

  // Basic認証通過後、NextAuth.jsの認証チェックは自動的に行われる
})

export const config = {
  matcher: ['/dashboard/:path*'],
}
