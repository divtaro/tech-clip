import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Supabase JS Client 経由でアクセスすることで、Supabase がアクティビティとして検出する
    // Prisma の直接接続（DATABASE_URL）は PostgreSQL への直接接続のため、
    // Supabase のアクティビティ監視をバイパスしてしまう
    const { count: userCount, error: userError } = await supabase
      .from('User')
      .select('*', { count: 'exact', head: true })

    const { count: articleCount, error: articleError } = await supabase
      .from('Article')
      .select('*', { count: 'exact', head: true })

    if (userError || articleError) {
      throw new Error(userError?.message || articleError?.message)
    }

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
