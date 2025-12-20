import { notFound } from "next/navigation"
import { getArticleById } from "@/actions/article-actions"
import { ArticleEditForm } from "@/components/article-edit-form"
import { ArticleDeleteDialog } from "@/components/article-delete-dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, ExternalLink, Calendar } from "lucide-react"
import Link from "next/link"
import { StatusBadge } from "@/components/status-badge"

export const dynamic = 'force-dynamic'

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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* ナビゲーションボタン */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard">
          <Button variant="ghost" className="h-10 w-10 p-0 flex items-center justify-center" aria-label="ダッシュボードに戻る">
            <ArrowLeft className="shrink-0" strokeWidth={2} style={{ width: '20px', height: '20px' }} />
          </Button>
        </Link>
        <ArticleDeleteDialog articleId={article.id} />
      </div>

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

      {/* タイトルセクション（タイトル・ステータスは左寄せ、ボタンのみ中央） */}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold leading-tight">
          {article.title || "タイトルなし"}
        </h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <StatusBadge status={article.status} />
          <time className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(article.createdAt).toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })}
          </time>
        </div>
        <div className="pt-2 flex justify-center md:justify-start">
          <Button asChild variant="outline" className="w-40">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="記事を新しいタブで開く"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              記事を読む
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
    </div>
  )
}
