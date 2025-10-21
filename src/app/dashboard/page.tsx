"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SearchBar } from "@/components/search-bar"
import { ArticleCard } from "@/components/article-card"
import { Plus } from "lucide-react"

type Status = "TO_READ" | "READING" | "COMPLETED"

interface Article {
  id: string
  url: string
  title: string
  description: string
  ogImage: string | null
  siteName: string
  status: Status
  createdAt: Date
}

// 仮データ
const MOCK_ARTICLES: Article[] = [
  {
    id: "1",
    url: "https://zenn.dev/example/articles/example1",
    title: "Next.js 14のApp Routerで学ぶモダンなWebアプリケーション開発",
    description: "Next.js 14で導入されたApp Routerの基本から応用まで、実践的な例を交えて詳しく解説します。Server ComponentsやServer Actionsを活用した効率的な開発手法を学びましょう。",
    ogImage: "https://placehold.co/600x400/3b82f6/ffffff?text=Next.js+14",
    siteName: "Zenn",
    status: "TO_READ",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    url: "https://qiita.com/example/items/example2",
    title: "Prismaで始めるType-SafeなDB操作",
    description: "PrismaはTypeScriptファーストなORMで、型安全なデータベース操作を実現します。スキーマ定義からマイグレーション、クエリの実装まで一通り解説します。",
    ogImage: "https://placehold.co/600x400/10b981/ffffff?text=Prisma",
    siteName: "Qiita",
    status: "READING",
    createdAt: new Date("2024-01-14"),
  },
  {
    id: "3",
    url: "https://note.com/example/n/example3",
    title: "shadcn/uiで作る美しいUIコンポーネント",
    description: "Radix UIとTailwind CSSを組み合わせたshadcn/uiの使い方を紹介。コピー&ペーストで使えるコンポーネントライブラリの活用方法を学びます。",
    ogImage: null,
    siteName: "note",
    status: "COMPLETED",
    createdAt: new Date("2024-01-13"),
  },
  {
    id: "4",
    url: "https://zenn.dev/example/articles/example4",
    title: "React Server Componentsの仕組みを理解する",
    description: "React Server Componentsがどのように動作するのか、その仕組みと利点について詳しく解説。クライアントコンポーネントとの使い分けも紹介します。",
    ogImage: "https://placehold.co/600x400/8b5cf6/ffffff?text=React+RSC",
    siteName: "Zenn",
    status: "TO_READ",
    createdAt: new Date("2024-01-12"),
  },
  {
    id: "5",
    url: "https://qiita.com/example/items/example5",
    title: "TypeScriptの型パズルで学ぶ高度な型システム",
    description: "TypeScriptの型システムを極めるための型パズル集。Conditional TypesやMapped Types、Template Literal Typesなど、高度な型の使い方をマスターしましょう。",
    ogImage: "https://placehold.co/600x400/f59e0b/ffffff?text=TypeScript",
    siteName: "Qiita",
    status: "READING",
    createdAt: new Date("2024-01-11"),
  },
  {
    id: "6",
    url: "https://zenn.dev/example/articles/example6",
    title: "Next.js × Prisma × NextAuthで作る認証機能",
    description: "NextAuthを使ったGoogle OAuth認証の実装方法を解説。Prisma Adapterを使ってユーザー情報をデータベースに保存する方法も紹介します。",
    ogImage: "https://placehold.co/600x400/ef4444/ffffff?text=NextAuth",
    siteName: "Zenn",
    status: "COMPLETED",
    createdAt: new Date("2024-01-10"),
  },
  {
    id: "7",
    url: "https://note.com/example/n/example7",
    title: "TailwindCSSのカスタマイズテクニック",
    description: "TailwindCSSの設定をカスタマイズして、プロジェクト固有のデザインシステムを構築する方法を紹介。カラーパレット、フォント、スペーシングなどの設定方法を解説します。",
    ogImage: null,
    siteName: "note",
    status: "TO_READ",
    createdAt: new Date("2024-01-09"),
  },
  {
    id: "8",
    url: "https://qiita.com/example/items/example8",
    title: "Reactのパフォーマンス最適化ベストプラクティス",
    description: "useMemoやuseCallbackの正しい使い方、React.memoの活用、コンポーネント分割の戦略など、Reactアプリケーションのパフォーマンスを改善するテクニックを紹介します。",
    ogImage: "https://placehold.co/600x400/06b6d4/ffffff?text=React+Performance",
    siteName: "Qiita",
    status: "READING",
    createdAt: new Date("2024-01-08"),
  },
]

export default function DashboardPage() {
  const [selectedStatus, setSelectedStatus] = useState<Status | "ALL">("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [articles, setArticles] = useState(MOCK_ARTICLES)

  const filteredArticles = articles.filter((article) => {
    const matchesStatus = selectedStatus === "ALL" || article.status === selectedStatus
    const matchesSearch =
      searchQuery === "" ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const handleDelete = (id: string) => {
    setArticles(articles.filter((article) => article.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* ステータスフィルター */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedStatus === "ALL" ? "default" : "outline"}
          onClick={() => setSelectedStatus("ALL")}
        >
          All ({articles.length})
        </Button>
        <Button
          variant={selectedStatus === "TO_READ" ? "default" : "outline"}
          onClick={() => setSelectedStatus("TO_READ")}
        >
          読みたい ({articles.filter((a) => a.status === "TO_READ").length})
        </Button>
        <Button
          variant={selectedStatus === "READING" ? "default" : "outline"}
          onClick={() => setSelectedStatus("READING")}
        >
          読んでいる ({articles.filter((a) => a.status === "READING").length})
        </Button>
        <Button
          variant={selectedStatus === "COMPLETED" ? "default" : "outline"}
          onClick={() => setSelectedStatus("COMPLETED")}
        >
          読んだ ({articles.filter((a) => a.status === "COMPLETED").length})
        </Button>
      </div>

      {/* 検索バー */}
      <SearchBar onSearch={setSearchQuery} />

      {/* 記事一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article) => (
          <ArticleCard key={article.id} article={article} onDelete={handleDelete} />
        ))}
      </div>

      {/* 結果が0件の場合 */}
      {filteredArticles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">記事が見つかりませんでした</p>
        </div>
      )}

      {/* FAB（記事追加ボタン） */}
      <Button
        size="lg"
        className="fixed bottom-8 right-8 rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-shadow"
        onClick={() => alert("記事追加機能は次のフェーズで実装します")}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  )
}
