"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          削除
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>記事を削除しますか？</AlertDialogTitle>
          <AlertDialogDescription>
            この操作は取り消せません。本当に削除しますか？
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            キャンセル
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                削除中
              </>
            ) : (
              "削除"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
