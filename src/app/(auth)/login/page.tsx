"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-950 dark:to-slate-900 p-4" style={{ height: '100dvh' }}>
      <Card className="w-full max-w-md shadow-xl border bg-white dark:bg-slate-900 -mt-8" style={{ borderColor: 'white' }}>
        <CardHeader className="space-y-6 text-center pb-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <CardTitle className="text-4xl font-bold text-slate-900 dark:text-white">
            TechClip
          </CardTitle>
          <CardDescription className="text-base text-slate-600 dark:text-slate-400">
            技術記事を一元管理して学習を加速
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-2 pb-8">
          <div className="flex justify-center">
            <Button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-64 h-12 text-base font-medium shadow-md hover:shadow-lg transition-all cursor-pointer text-white border"
              style={{ borderColor: 'white' }}
              size="lg"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" suppressHydrationWarning>
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Googleでログイン
            </Button>
          </div>

          {/* Notice removed per request: Terms and Privacy links/text */}
        </CardContent>
      </Card>
    </div>
  )
}
