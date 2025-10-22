"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createArticleSchema, type CreateArticleInput } from "@/lib/validations/article"
import { revalidatePath } from "next/cache"

export async function createArticle(input: CreateArticleInput) {
  try {
    // セッションチェック
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" }
    }

    // バリデーション
    const validatedData = createArticleSchema.parse(input)

    // 重複チェック
    const existingArticle = await prisma.article.findUnique({
      where: {
        userId_url: {
          userId: session.user.id,
          url: validatedData.url,
        },
      },
    })

    if (existingArticle) {
      return { success: false, error: "この記事は既に登録されています" }
    }

    // 記事作成
    const article = await prisma.article.create({
      data: {
        userId: session.user.id,
        url: validatedData.url,
        title: validatedData.title,
        description: validatedData.description,
        ogImage: validatedData.ogImage,
        siteName: validatedData.siteName,
        status: validatedData.status,
        memo: validatedData.memo,
      },
    })

    revalidatePath("/dashboard")

    return { success: true, data: article }
  } catch (error) {
    console.error("記事作成エラー:", error)
    return { success: false, error: "記事の登録に失敗しました" }
  }
}

export async function getArticles() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です", data: [] }
    }

    const articles = await prisma.article.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return { success: true, data: articles }
  } catch (error) {
    console.error("記事取得エラー:", error)
    return { success: false, error: "記事の取得に失敗しました", data: [] }
  }
}

export async function deleteArticle(id: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" }
    }

    // 記事の所有者チェック
    const article = await prisma.article.findUnique({
      where: { id },
    })

    if (!article || article.userId !== session.user.id) {
      return { success: false, error: "記事が見つかりません" }
    }

    await prisma.article.delete({
      where: { id },
    })

    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("記事削除エラー:", error)
    return { success: false, error: "記事の削除に失敗しました" }
  }
}
