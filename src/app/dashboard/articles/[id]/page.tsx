import { notFound } from "next/navigation"
import { getArticleById } from "@/actions/article-actions"
import { ArticleEditForm } from "@/components/article-edit-form"
import { ArticleDeleteDialog } from "@/components/article-delete-dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, ExternalLink } from "lucide-react"
import Link from "next/link"
import { StatusBadge } from "@/components/status-badge"

interface ArticlePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { id } = await params
  const result = await getArticleById(id)

  if (!result.success || !result.data) {
    notFound()
  }

  const article = result.data

  return (
    <div className="min-h-screen bg-background">
      {/* ナビゲーション */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container max-w-4xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                戻る
              </Button>
            </Link>
            <ArticleDeleteDialog articleId={article.id} />
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="container max-w-4xl px-4 py-8 space-y-8">
        {/* OGP画像 */}
        {article.ogImage ? (
          <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
            <img
              src={article.ogImage}
              alt={article.title || "記事画像"}
              className="object-cover w-full h-full"
            />
          </div>
        ) : (
          <div className="aspect-video w-full overflow-hidden rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-950 flex items-center justify-center">
            <span className="text-6xl opacity-20">📄</span>
          </div>
        )}

        {/* タイトルセクション */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <StatusBadge status={article.status} />
            <h1 className="text-3xl font-bold flex-1">
              {article.title || "タイトルなし"}
            </h1>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            {article.siteName && (
              <p className="flex items-center gap-2">
                <span className="font-medium">サイト:</span>
                {article.siteName}
              </p>
            )}
            <p className="flex items-center gap-2">
              <span className="font-medium">URL:</span>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline truncate flex-1"
              >
                {article.url}
              </a>
            </p>
            <p className="flex items-center gap-2">
              <span className="font-medium">登録日時:</span>
              {new Date(article.createdAt).toLocaleString("ja-JP", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          {article.description && (
            <p className="text-muted-foreground leading-relaxed">
              {article.description}
            </p>
          )}

          <div>
            <Button asChild>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                記事を開く
              </a>
            </Button>
          </div>
        </div>

        {/* 編集フォーム */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">編集</h2>
          <ArticleEditForm
            articleId={article.id}
            initialStatus={article.status}
            initialMemo={article.memo}
          />
        </Card>
      </main>
    </div>
  )
}
