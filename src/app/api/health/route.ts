import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // 実際のテーブルにアクセスしてSupabaseのアクティビティとして検出されるようにする
    // SELECT 1 だけでは Supabase がアクティビティとしてカウントしない
    const userCount = await prisma.user.count()
    const articleCount = await prisma.article.count()

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: "connected",
      stats: {
        users: userCount,
        articles: articleCount
      }
    })
  } catch (error) {
    console.error("Health check failed:", error)
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
