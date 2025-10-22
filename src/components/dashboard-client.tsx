"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SearchBar } from "@/components/search-bar"
import { ArticleCard } from "@/components/article-card"
import { ArticleCreateModal } from "@/components/article-create-modal"
import { Plus } from "lucide-react"
import { deleteArticle } from "@/actions/article-actions"
import toast from "react-hot-toast"

type Status = "TO_READ" | "READING" | "COMPLETED"

interface Article {
  id: string
  url: string
  title: string | null
  description: string | null
  ogImage: string | null
  siteName: string | null
  status: Status
  createdAt: Date
}

interface DashboardClientProps {
  initialArticles: Article[]
}

export function DashboardClient({ initialArticles }: DashboardClientProps) {
  const [selectedStatus, setSelectedStatus] = useState<Status | "ALL">("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const filteredArticles = initialArticles.filter((article) => {
    const matchesStatus = selectedStatus === "ALL" || article.status === selectedStatus
    const matchesSearch =
      searchQuery === "" ||
      article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const handleDelete = async (id: string) => {
    const result = await deleteArticle(id)
    if (result.success) {
      toast.success("記事を削除しました")
      // revalidatePathで自動的に再取得される
    } else {
      toast.error(result.error || "記事の削除に失敗しました")
    }
  }

  return (
    <div className="space-y-6">
      {/* ステータスフィルター */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedStatus === "ALL" ? "default" : "outline"}
          onClick={() => setSelectedStatus("ALL")}
        >
          All ({initialArticles.length})
        </Button>
        <Button
          variant={selectedStatus === "TO_READ" ? "default" : "outline"}
          onClick={() => setSelectedStatus("TO_READ")}
        >
          読みたい ({initialArticles.filter((a) => a.status === "TO_READ").length})
        </Button>
        <Button
          variant={selectedStatus === "READING" ? "default" : "outline"}
          onClick={() => setSelectedStatus("READING")}
        >
          読んでいる ({initialArticles.filter((a) => a.status === "READING").length})
        </Button>
        <Button
          variant={selectedStatus === "COMPLETED" ? "default" : "outline"}
          onClick={() => setSelectedStatus("COMPLETED")}
        >
          読んだ ({initialArticles.filter((a) => a.status === "COMPLETED").length})
        </Button>
      </div>

      {/* 検索バー */}
      <SearchBar onSearch={setSearchQuery} />

      {/* 記事一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article) => (
          <ArticleCard
            key={article.id}
            article={{
              ...article,
              title: article.title || "タイトルなし",
              description: article.description || "",
              siteName: article.siteName || "",
            }}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* 結果が0件の場合 */}
      {filteredArticles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {initialArticles.length === 0
              ? "記事がありません。右下のボタンから記事を登録しましょう！"
              : "記事が見つかりませんでした"}
          </p>
        </div>
      )}

      {/* FAB（記事追加ボタン） */}
      <Button
        size="lg"
        className="fixed bottom-8 right-8 rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-shadow"
        onClick={() => setIsCreateModalOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* 記事登録モーダル */}
      <ArticleCreateModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </div>
  )
}
