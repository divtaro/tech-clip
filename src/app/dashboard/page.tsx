import { getArticles } from "@/actions/article-actions"
import { DashboardClient } from "@/components/dashboard-client"

export default async function DashboardPage() {
  const result = await getArticles()

  return <DashboardClient initialArticles={result.data} />
}
