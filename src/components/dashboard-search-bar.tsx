"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDebouncedCallback } from "use-debounce"

export function DashboardSearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get("q") || "")

  const debouncedSearch = useDebouncedCallback((value: string) => {
    if (value) {
      router.push(`/dashboard?q=${encodeURIComponent(value)}`)
    } else {
      router.push("/dashboard")
    }
  }, 300)

  useEffect(() => {
    setQuery(searchParams.get("q") || "")
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    debouncedSearch(value)
  }

  const handleClear = () => {
    setQuery("")
    router.push("/dashboard")
  }

  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        placeholder="記事を検索..."
        className="pl-10 pr-10 focus:border-primary focus:ring-1 focus:ring-primary"
        value={query}
        onChange={handleChange}
        suppressHydrationWarning
      />
      {query && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
          onClick={handleClear}
          aria-label="検索をクリア"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
