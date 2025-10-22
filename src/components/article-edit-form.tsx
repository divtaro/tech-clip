"use client"

import { useState, useTransition } from "react"
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
import toast from "react-hot-toast"

type Status = "TO_READ" | "READING" | "COMPLETED"

interface ArticleEditFormProps {
  articleId: string
  initialStatus: Status
  initialMemo: string | null
}

const statusLabels = {
  TO_READ: "読みたい",
  READING: "読んでいる",
  COMPLETED: "読んだ",
}

export function ArticleEditForm({
  articleId,
  initialStatus,
  initialMemo,
}: ArticleEditFormProps) {
  const [status, setStatus] = useState<Status>(initialStatus)
  const [memo, setMemo] = useState(initialMemo || "")
  const [isPending, startTransition] = useTransition()

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
      } else {
        toast.error(result.error || "保存に失敗しました")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ステータス選択 */}
      <div className="space-y-2">
        <Label htmlFor="status">ステータス</Label>
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
        />
      </div>

      {/* 保存ボタン */}
      <Button
        type="submit"
        disabled={!hasChanges || isPending}
        className="w-full sm:w-auto"
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
    </form>
  )
}
