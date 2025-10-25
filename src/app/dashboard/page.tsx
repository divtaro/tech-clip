import { getArticles } from "@/actions/article-actions"
import { DashboardClient } from "@/components/dashboard-client"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const params = await searchParams
  const result = await getArticles()
  const searchQuery = params.q || ""

  return <DashboardClient initialArticles={result.data} searchQuery={searchQuery} />
}
