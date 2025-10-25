import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft } from "lucide-react"

export default function ArticleDetailLoading() {
  return (
    <div className="space-y-6">
      {/* 戻るボタン */}
      <div className="flex items-center gap-2">
        <div className="p-2">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </div>
        <Skeleton className="h-5 w-32" />
      </div>

      {/* 記事カード */}
      <div className="border rounded-lg overflow-hidden">
        {/* OG画像 */}
        <Skeleton className="w-full h-64" />

        {/* 記事情報 */}
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>

          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-md" />
            </div>
          </div>
        </div>
      </div>

      {/* メモセクション */}
      <div className="border rounded-lg p-6 space-y-4">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  )
}
