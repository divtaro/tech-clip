"use client"

import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSearch } from "@/contexts/search-context"

export function DashboardSearchBar() {
  const { searchQuery, setSearchQuery } = useSearch()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleClear = () => {
    setSearchQuery("")
  }

  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        placeholder="検索"
        className="pl-10 pr-10 focus:border-primary focus:ring-1 focus:ring-primary"
        value={searchQuery}
        onChange={handleChange}
      />
      {searchQuery && (
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
