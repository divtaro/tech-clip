"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { deleteArticleAndRedirect } from "@/actions/article-actions"
import toast from "react-hot-toast"

interface ArticleDeleteDialogProps {
  articleId: string
}

export function ArticleDeleteDialog({ articleId }: ArticleDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [open, setOpen] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)

    // 削除成功時のトーストを先に表示
    toast.success("記事を削除しました")

    try {
      // redirect()はエラーをthrowするため、成功時はここで処理が中断される
      await deleteArticleAndRedirect(articleId)
    } catch (error) {
      // redirect()によるエラーの場合は正常動作なので何もしない
      // それ以外のエラーの場合のみエラー処理
      if (error && typeof error === 'object' && 'digest' in error) {
        // Next.jsのredirectエラー（NEXT_REDIRECT）の場合は何もしない
        throw error
      } else {
        // 実際のエラーの場合
        console.error("削除エラー:", error)
        toast.error("削除に失敗しました")
        setIsDeleting(false)
        setOpen(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="icon" aria-label="記事を削除" className="border-0">
          <Trash2 className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm" hideClose>
        <DialogHeader>
          <DialogTitle className="text-center">記事を削除しますか？</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-4 items-center">
          <Button
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={isDeleting}
            className="w-40 text-white border-0"
            style={{ backgroundColor: 'hsl(0 84.2% 60.2%)' }}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                削除中
              </>
            ) : (
              "削除"
            )}
          </Button>
          <Button
            onClick={() => setOpen(false)}
            className="w-40 border"
            style={{ borderColor: 'hsl(0 0% 60%)' }}
          >
            キャンセル
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
