"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MoreVertical, Pencil, ExternalLink, Trash2, Calendar } from "lucide-react"

type Status = "TO_READ" | "READING" | "COMPLETED"

interface Article {
  id: string
  url: string
  title?: string | null
  description?: string | null
  ogImage?: string | null
  siteName?: string | null
  status: Status
  createdAt: Date
}

interface ArticleCardProps {
  article: Article
  onDelete?: (id: string) => void
}

export function ArticleCard({ article, onDelete }: ArticleCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDelete = () => {
    onDelete?.(article.id)
    setShowDeleteDialog(false)
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // ドロップダウンメニューのクリックを無視
    if ((e.target as HTMLElement).closest('[data-dropdown-trigger]')) {
      e.preventDefault()
    }
  }

  return (
    <>
      <Link href={`/dashboard/articles/${article.id}`} onClick={handleCardClick}>
        <Card className="overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg relative group h-full flex flex-col">
          {/* 3点リーダー */}
          <div className="absolute top-2 right-2 z-10" data-dropdown-trigger>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm hover:bg-background"
                  onClick={(e) => e.preventDefault()}
                  aria-label="メニューを開く"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault()
                    window.location.href = `/dashboard/articles/${article.id}`
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  <span>編集</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault()
                    window.open(article.url, "_blank", "noopener,noreferrer")
                  }}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  <span>記事を開く</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={(e) => {
                    e.preventDefault()
                    setShowDeleteDialog(true)
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>削除</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* OGP画像 */}
          <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-950">
            {article.ogImage ? (
              <img
                src={article.ogImage}
                alt={article.title || "記事画像"}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-4xl opacity-20">📄</span>
              </div>
            )}
          </div>

          <CardContent className="p-4 space-y-2 flex-1 flex flex-col">
            {/* サイト名 */}
            {article.siteName && (
              <p className="text-xs text-muted-foreground truncate">
                {article.siteName}
              </p>
            )}

            {/* タイトル */}
            <h3 className="font-semibold line-clamp-2 h-12">
              {article.title || "タイトルなし"}
            </h3>

            {/* 説明文 - 固定高さで3行表示 */}
            <p className="text-sm text-muted-foreground line-clamp-3 h-[4.5rem]">
              {article.description || ""}
            </p>

            {/* フッター - 下部に固定 */}
            <div className="flex items-center justify-between pt-2 mt-auto">
              <StatusBadge status={article.status} />
              <time className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(article.createdAt).toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })}
              </time>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* 削除確認ダイアログ */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">記事を削除しますか？</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-4">
            <Button variant="destructive" onClick={handleDelete} className="w-full">
              削除
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
