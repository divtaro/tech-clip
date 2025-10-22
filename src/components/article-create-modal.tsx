"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { createArticle } from "@/actions/article-actions"
import toast from "react-hot-toast"
import { z } from "zod"

interface ArticleCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Status = "TO_READ" | "READING" | "COMPLETED"

interface OGPData {
  title: string | null
  description: string | null
  ogImage: string | null
  siteName: string | null
}

const urlSchema = z.string().url("有効なURLを入力してください")

export function ArticleCreateModal({ open, onOpenChange }: ArticleCreateModalProps) {
  const [url, setUrl] = useState("")
  const [urlError, setUrlError] = useState("")
  const [ogpData, setOgpData] = useState<OGPData | null>(null)
  const [status, setStatus] = useState<Status>("TO_READ")
  const [memo, setMemo] = useState("")
  const [isFetching, setIsFetching] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleUrlBlur = () => {
    try {
      urlSchema.parse(url)
      setUrlError("")
    } catch (error) {
      if (error instanceof z.ZodError) {
        setUrlError(error.errors[0].message)
      }
    }
  }

  const handleFetchOGP = async () => {
    try {
      urlSchema.parse(url)
      setUrlError("")
    } catch (error) {
      if (error instanceof z.ZodError) {
        setUrlError(error.errors[0].message)
        return
      }
    }

    setIsFetching(true)
    try {
      const response = await fetch("/api/ogp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "OGP情報の取得に失敗しました")
        return
      }

      setOgpData(data)
      toast.success("OGP情報を取得しました")
    } catch (error) {
      console.error("OGP取得エラー:", error)
      toast.error("OGP情報の取得に失敗しました")
    } finally {
      setIsFetching(false)
    }
  }

  const handleSubmit = async () => {
    if (!ogpData) {
      toast.error("先にOGP情報を取得してください")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createArticle({
        url,
        title: ogpData.title,
        description: ogpData.description,
        ogImage: ogpData.ogImage,
        siteName: ogpData.siteName,
        status,
        memo: memo || null,
      })

      if (result.success) {
        toast.success("記事を登録しました")
        handleClose()
      } else {
        toast.error(result.error || "記事の登録に失敗しました")
      }
    } catch (error) {
      console.error("記事登録エラー:", error)
      toast.error("記事の登録に失敗しました")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setUrl("")
    setUrlError("")
    setOgpData(null)
    setStatus("TO_READ")
    setMemo("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>記事を登録</DialogTitle>
          <DialogDescription>
            記事のURLを入力して、OGP情報を取得してください
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* URL入力 */}
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com/article"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onBlur={handleUrlBlur}
                  disabled={isFetching}
                />
                {urlError && (
                  <p className="text-sm text-destructive mt-1">{urlError}</p>
                )}
              </div>
              <Button
                onClick={handleFetchOGP}
                disabled={isFetching || !url}
              >
                {isFetching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    取得中
                  </>
                ) : (
                  "取得"
                )}
              </Button>
            </div>
          </div>

          {/* OGPプレビュー */}
          {ogpData && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {ogpData.ogImage && (
                    <div className="aspect-video w-full overflow-hidden rounded-md bg-muted">
                      <img
                        src={ogpData.ogImage}
                        alt={ogpData.title || "記事画像"}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                  {ogpData.siteName && (
                    <p className="text-xs text-muted-foreground">
                      {ogpData.siteName}
                    </p>
                  )}
                  {ogpData.title && (
                    <h3 className="font-semibold">{ogpData.title}</h3>
                  )}
                  {ogpData.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {ogpData.description}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ステータス選択 */}
          <div className="space-y-2">
            <Label htmlFor="status">ステータス</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as Status)}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TO_READ">読みたい</SelectItem>
                <SelectItem value="READING">読んでいる</SelectItem>
                <SelectItem value="COMPLETED">読んだ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* メモ */}
          <div className="space-y-2">
            <Label htmlFor="memo">メモ（任意）</Label>
            <Textarea
              id="memo"
              placeholder="この記事についてのメモを入力..."
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            キャンセル
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!ogpData || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                登録中
              </>
            ) : (
              "登録"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
