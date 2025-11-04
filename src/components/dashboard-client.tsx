"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ArticleCard } from "@/components/article-card"
import { ArticleCreateModal } from "@/components/article-create-modal"
import { EmptyState } from "@/components/empty-state"
import { deleteArticle } from "@/actions/article-actions"
import toast from "react-hot-toast"
import { useSearch } from "@/contexts/search-context"

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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const { searchQuery } = useSearch()
  const searchParams = useSearchParams()
  const router = useRouter()
  const hasShownToast = useRef(false)

  // 記事更新後のトースト通知
  useEffect(() => {
    const updated = searchParams.get("updated")
    if (updated === "true" && !hasShownToast.current) {
      hasShownToast.current = true
      // クエリパラメータをクリア（トーストより先に実行）
      router.replace("/dashboard", { scroll: false })
      toast.success("保存しました")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // useMemoで検索とフィルタリングを最適化
  const filteredArticles = useMemo(() => {
    return initialArticles.filter((article) => {
      const matchesStatus = selectedStatus === "ALL" || article.status === selectedStatus
      const matchesSearch =
        searchQuery === "" ||
        article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.siteName?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesStatus && matchesSearch
    })
  }, [initialArticles, selectedStatus, searchQuery])


  const handleDelete = async (id: string) => {
    const result = await deleteArticle(id)
    if (result.success) {
      toast.success("記事を削除しました")
      // revalidatePathで自動的に再取得される
    } else {
      toast.error(result.error || "記事の削除に失敗しました")
    }
  }

  // 記事が0件の場合は空状態を表示
  if (initialArticles.length === 0) {
    return (
      <div>
        <EmptyState onAddClick={() => setIsCreateModalOpen(true)} />
        <ArticleCreateModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
        />
      </div>
    )
  }

  return (
    <div>
      {/* ステータスフィルター - モダンなタブスタイル with アニメーション + Sticky */}
      <div className="md:sticky top-0 z-[60] border-b pb-3 px-4 pt-4 mb-4" style={{ backgroundColor: 'hsl(var(--background))' }}>
        <div className="flex w-full justify-center gap-6 overflow-x-auto">
        <button
          onClick={() => setSelectedStatus("TO_READ")}
          className={`pb-3 px-2 text-sm whitespace-nowrap transition-all relative ${
            selectedStatus === "TO_READ"
              ? "text-primary font-bold"
              : "text-muted-foreground/60 hover:text-foreground hover:bg-accent/30 hover:font-bold font-medium"
          }`}
          style={{
            borderBottom: selectedStatus === "TO_READ" ? "3px solid hsl(var(--primary))" : "3px solid transparent"
          }}
        >
          読みたい
        </button>
        <button
          onClick={() => setSelectedStatus("READING")}
          className={`pb-3 px-2 text-sm whitespace-nowrap transition-all relative ${
            selectedStatus === "READING"
              ? "text-primary font-bold"
              : "text-muted-foreground/60 hover:text-foreground hover:bg-accent/30 hover:font-bold font-medium"
          }`}
          style={{
            borderBottom: selectedStatus === "READING" ? "3px solid hsl(var(--primary))" : "3px solid transparent"
          }}
        >
          読んでる
        </button>
        <button
          onClick={() => setSelectedStatus("COMPLETED")}
          className={`pb-3 px-2 text-sm whitespace-nowrap transition-all relative ${
            selectedStatus === "COMPLETED"
              ? "text-primary font-bold"
              : "text-muted-foreground/60 hover:text-foreground hover:bg-accent/30 hover:font-bold font-medium"
          }`}
          style={{
            borderBottom: selectedStatus === "COMPLETED" ? "3px solid hsl(var(--primary))" : "3px solid transparent"
          }}
        >
          読んだ
        </button>
        <button
          onClick={() => setSelectedStatus("ALL")}
          className={`pb-3 px-2 text-sm whitespace-nowrap transition-all relative ${
            selectedStatus === "ALL"
              ? "text-primary font-bold"
              : "text-muted-foreground/60 hover:text-foreground hover:bg-accent/30 hover:font-bold font-medium"
          }`}
          style={{
            borderBottom: selectedStatus === "ALL" ? "3px solid hsl(var(--primary))" : "3px solid transparent"
          }}
        >
          すべて
        </button>
        </div>
      </div>

      {/* 記事一覧 */}
      {filteredArticles.length > 0 ? (
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
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            記事が見つかりませんでした
          </p>
        </div>
      )}

      {/* FAB（記事追加ボタン） */}
      <button
        className="fixed right-8 rounded-full h-16 w-16 shadow-2xl hover:shadow-2xl transition-all z-50 border-0 flex items-center justify-center text-white text-4xl leading-none pb-1"
        style={{
          backgroundColor: 'hsl(var(--primary))',
          fontWeight: 300,
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 2rem)'
        }}
        onClick={() => setIsCreateModalOpen(true)}
        aria-label="記事を登録"
      >
        +
      </button>

      {/* 記事登録モーダル */}
      <ArticleCreateModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </div>
  )
}
