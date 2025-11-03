"use client"

import { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { updateArticle } from "@/actions/article-actions"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"

type Status = "TO_READ" | "READING" | "COMPLETED"

interface ArticleEditFormProps {
  articleId: string
  initialStatus: Status
  initialMemo: string | null
}

const statusLabels = {
  TO_READ: "読みたい",
  READING: "読んでる",
  COMPLETED: "読んだ",
}

export function ArticleEditForm({
  articleId,
  initialStatus,
  initialMemo,
}: ArticleEditFormProps) {
  const router = useRouter()
  const [status, setStatus] = useState<Status>(initialStatus)
  const [memo, setMemo] = useState(initialMemo || "")
  const [isPending, startTransition] = useTransition()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const hasChanges =
    status !== initialStatus || memo !== (initialMemo || "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!hasChanges) {
      toast.error("変更がありません")
      return
    }

    startTransition(async () => {
      const result = await updateArticle(articleId, {
        status,
        memo: memo || null,
      })

      if (result.success) {
        toast.success("保存しました")
        router.push("/dashboard")
      } else {
        toast.error(result.error || "保存に失敗しました")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" suppressHydrationWarning>
      {/* ステータス選択 */}
      <div className="space-y-2">
        <Label htmlFor="status">ステータス</Label>
        {isMounted ? (
          <Select value={status} onValueChange={(value) => setStatus(value as Status)}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TO_READ">{statusLabels.TO_READ}</SelectItem>
              <SelectItem value="READING">{statusLabels.READING}</SelectItem>
              <SelectItem value="COMPLETED">{statusLabels.COMPLETED}</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <div className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm">
            {statusLabels[initialStatus]}
          </div>
        )}
      </div>

      {/* メモ入力 */}
      <div className="space-y-2">
        <Label htmlFor="memo">メモ</Label>
        <Textarea
          id="memo"
          placeholder="この記事についてのメモを入力..."
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={8}
          className="resize-none"
          suppressHydrationWarning
        />
      </div>

      {/* 保存ボタン（モバイル中央／デスクトップ左） */}
      <div className="flex justify-center md:justify-start">
        <Button
          type="submit"
          variant={hasChanges && !isPending ? "primary" : "default"}
          disabled={!hasChanges || isPending}
          className="w-40"
          style={hasChanges && !isPending ? { backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', border: 'none' } : undefined}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              保存中
            </>
          ) : (
            "保存"
          )}
        </Button>
      </div>
    </form>
  )
}
