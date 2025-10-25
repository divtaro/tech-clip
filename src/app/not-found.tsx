import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileQuestion } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted">
          <FileQuestion className="h-10 w-10 text-muted-foreground" suppressHydrationWarning />
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-foreground">404</h1>
          <h2 className="text-2xl font-semibold">ページが見つかりません</h2>
          <p className="text-muted-foreground">
            お探しのページは存在しないか、移動または削除された可能性があります。
          </p>
        </div>

        <div className="flex justify-center">
          <Button asChild>
            <Link href="/">ホームへ</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
