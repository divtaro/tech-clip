"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="rounded-full bg-destructive/10 p-6">
        <AlertCircle className="h-12 w-12 text-destructive" />
      </div>
      <h2 className="text-2xl font-semibold">エラーが発生しました</h2>
      <p className="text-muted-foreground text-center max-w-md">
        申し訳ございません。問題が発生しました。
        <br />
        再試行するか、ダッシュボードに戻ってください。
      </p>
      <div className="flex gap-2">
        <Button onClick={reset} variant="default">
          再試行
        </Button>
        <Button variant="outline" onClick={() => (window.location.href = "/dashboard")}>
          ダッシュボードに戻る
        </Button>
      </div>
    </div>
  )
}
