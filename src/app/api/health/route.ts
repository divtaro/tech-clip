import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // データベース接続を確認（簡単なクエリ）
    await prisma.$queryRaw`SELECT 1`

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: "connected"
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
