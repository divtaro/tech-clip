import { BookOpen, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  onAddClick: () => void
}

export function EmptyState({ onAddClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 text-center py-12">
      <div className="rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-950 p-8">
        <BookOpen className="h-16 w-16 text-blue-600 dark:text-blue-400" />
      </div>

      <div className="space-y-3 max-w-md">
        <h3 className="text-2xl font-semibold">記事がありません</h3>
        <p className="text-muted-foreground text-base">
          最初の記事を登録して、技術記事の学習を始めましょう。
          <br />
          URLを入力するだけで、記事情報が自動的に取得されます。
        </p>
      </div>

      <Button onClick={onAddClick} size="lg" className="shadow-md hover:shadow-lg transition-all">
        <Plus className="mr-2 h-5 w-5" />
        最初の記事を登録
      </Button>

      <div className="pt-4 text-sm text-muted-foreground">
        <p>💡 記事は「読みたい」「読んでいる」「読んだ」の3つのステータスで管理できます</p>
      </div>
    </div>
  )
}
