import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Supabase JS Client 経由で書き込み操作を行うことで、
    // Supabase がアクティビティとして確実に検出する
    const timestamp = new Date().toISOString()

    // HealthCheckテーブルにレコードを挿入（書き込み操作）
    const { error: insertError } = await supabase
      .from('HealthCheck')
      .insert({
        timestamp,
        source: 'github-actions'
      })

    if (insertError) {
      throw new Error(insertError.message)
    }

    // 統計情報の取得（読み取り操作）
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
      timestamp,
      database: "connected",
      activityLogged: true,
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
        activityLogged: false,
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
