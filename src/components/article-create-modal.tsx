"use client"

import { useState, useEffect } from "react"
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
import { Loader2, AlertCircle } from "lucide-react"
import { createArticle } from "@/actions/article-actions"
import toast from "react-hot-toast"
import { z } from "zod"
import { useDebouncedCallback } from "use-debounce"

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

// URL正規化関数
const normalizeUrl = (input: string): string => {
  // 前後の空白を削除
  let normalized = input.trim()

  // 全角文字を半角に変換
  normalized = normalized.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => {
    return String.fromCharCode(s.charCodeAt(0) - 0xFEE0)
  })

  // 全角スラッシュを半角に
  normalized = normalized.replace(/／/g, '/')

  // 全角コロンを半角に
  normalized = normalized.replace(/：/g, ':')

  // 全角ドットを半角に
  normalized = normalized.replace(/．/g, '.')

  return normalized
}

// 厳密なURL検証関数
const isValidUrl = (urlString: string): boolean => {
  // 空文字チェック
  if (!urlString || !urlString.trim()) {
    return false
  }

  // 正規化
  const normalized = normalizeUrl(urlString)

  // URL形式チェック
  try {
    const url = new URL(normalized)

    // http/httpsのみ許可
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return false
    }

    // ホスト名の検証（日本語ドメインなどを除外）
    if (!/^[a-zA-Z0-9.-]+$/.test(url.hostname)) {
      return false
    }

    // パスに全角文字が含まれていないかチェック
    if (/[^\x00-\x7F]/.test(url.pathname)) {
      return false
    }

    // クエリパラメータに全角文字が含まれていないかチェック
    if (url.search && /[^\x00-\x7F]/.test(url.search)) {
      return false
    }

    return true
  } catch {
    return false
  }
}

export function ArticleCreateModal({ open, onOpenChange }: ArticleCreateModalProps) {
  const [url, setUrl] = useState("")
  const [urlError, setUrlError] = useState("")
  const [ogpData, setOgpData] = useState<OGPData | null>(null)
  const [status, setStatus] = useState<Status>("TO_READ")
  const [memo, setMemo] = useState("")
  const [isFetching, setIsFetching] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // デバウンス付き自動OGP取得
  const debouncedFetchOgp = useDebouncedCallback(
    async (inputUrl: string) => {
      // URL正規化
      const normalizedUrl = normalizeUrl(inputUrl)

      // 空文字チェック
      if (!normalizedUrl) {
        setOgpData(null)
        setUrlError("")
        return
      }

      // 厳密なURL検証
      if (!isValidUrl(normalizedUrl)) {
        setOgpData(null)
        setUrlError("正しいURLを入力してください")
        return
      }

      // URL検証OK
      setUrlError("")

      // OGP取得
      setIsFetching(true)

      try {
        const response = await fetch("/api/ogp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: normalizedUrl }),
        })

        if (!response.ok) {
          setOgpData(null)
          setUrlError("記事情報を取得できませんでした")
          setIsFetching(false)
          return
        }

        const data = await response.json()

        // OGPデータの検証
        if (!data || !data.title) {
          setOgpData(null)
          setUrlError("記事情報を取得できませんでした")
          setIsFetching(false)
          return
        }

        setOgpData(data)
        setUrlError("")
      } catch (error) {
        console.error("OGP取得エラー:", error)
        setOgpData(null)
        setUrlError("記事情報を取得できませんでした")
      } finally {
        setIsFetching(false)
      }
    },
    500
  )

  // URL変更時に自動実行
  useEffect(() => {
    debouncedFetchOgp(url)
  }, [url, debouncedFetchOgp])

  const handleSubmit = async () => {
    // 最終チェック
    const normalizedUrl = normalizeUrl(url)

    if (!isValidUrl(normalizedUrl)) {
      toast.error("正しいURLを入力してください")
      return
    }

    if (!ogpData) {
      toast.error("記事情報を取得してください")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createArticle({
        url: normalizedUrl,
        title: ogpData.title,
        description: ogpData.description,
        ogImage: ogpData.ogImage,
        siteName: ogpData.siteName,
        status,
        memo: memo || null,
      })

      if (result.success) {
        handleClose()
        // リダイレクト後にトースト通知を表示
        window.location.href = '/dashboard?created=true'
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
      <DialogContent
        className="max-w-2xl max-h-[85vh] flex flex-col p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="space-y-3 px-6 pt-6 pb-4 shrink-0">
          <DialogTitle>記事を登録</DialogTitle>
          <DialogDescription>
            記事のURLを入力すると自動で情報を取得します
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 pb-6 overflow-y-auto flex-1">
          {/* URL入力 */}
          <div className="space-y-2">
            <div className="relative">
              <Input
                id="url"
                type="url"
                placeholder="https://example.com/article"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pr-10"
              />
              {url && !isFetching && (
                <button
                  type="button"
                  onClick={() => {
                    setUrl("")
                    setOgpData(null)
                    setUrlError("")
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="クリア"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              {isFetching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          {/* OGP取得失敗メッセージ（統合版） */}
          {url && !isFetching && !ogpData && urlError && (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-2" />
              <p className="text-destructive font-medium">{urlError}</p>
            </div>
          )}

          {/* OGP取得成功後に表示 */}
          {ogpData && (
            <>
              {/* OGPプレビュー */}
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

              {/* ステータス選択 */}
              <div className="space-y-2">
                <Label htmlFor="status">ステータス</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as Status)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={4}>
                    <SelectItem value="TO_READ">読みたい</SelectItem>
                    <SelectItem value="READING">読んでる</SelectItem>
                    <SelectItem value="COMPLETED">読んだ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* メモ入力 */}
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
            </>
          )}
        </div>

        {ogpData && (
          <DialogFooter className="px-6 py-4 border-t bg-background shrink-0 !flex !flex-row !justify-center">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || isFetching}
              className="w-48 h-12 text-white border-0"
              style={{ backgroundColor: 'hsl(var(--primary))' }}
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
        )}
      </DialogContent>
    </Dialog>
  )
}
