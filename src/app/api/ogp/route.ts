import { NextRequest, NextResponse } from "next/server"
import * as cheerio from "cheerio"
import { z } from "zod"

const urlSchema = z.object({
  url: z.string().url("有効なURLを入力してください"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = urlSchema.parse(body)

    // URLを取得
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; TechClipBot/1.0)",
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: "URLの取得に失敗しました" },
        { status: 400 }
      )
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // OGP情報を取得
    const ogTitle = $('meta[property="og:title"]').attr("content")
    const ogDescription = $('meta[property="og:description"]').attr("content")
    const ogImage = $('meta[property="og:image"]').attr("content")
    const ogSiteName = $('meta[property="og:site_name"]').attr("content")

    // フォールバック
    const title = ogTitle || $("title").text() || null
    const description =
      ogDescription || $('meta[name="description"]').attr("content") || null
    const image = ogImage || null
    const siteName = ogSiteName || new URL(url).hostname || null

    return NextResponse.json({
      title,
      description,
      ogImage: image,
      siteName,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error("OGP取得エラー:", error)
    return NextResponse.json(
      { error: "OGP情報の取得に失敗しました" },
      { status: 500 }
    )
  }
}
