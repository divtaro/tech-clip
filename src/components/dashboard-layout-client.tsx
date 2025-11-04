"use client"

import { ReactNode } from "react"
import { SearchProvider } from "@/contexts/search-context"
import { DashboardHeader } from "@/components/dashboard-header"

interface DashboardLayoutClientProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  logoutButton: ReactNode
  children: ReactNode
}

export function DashboardLayoutClient({
  user,
  logoutButton,
  children,
}: DashboardLayoutClientProps) {
  return (
    <SearchProvider>
      <div className="min-h-[100dvh] bg-background flex flex-col">
        {/* Header */}
        <DashboardHeader user={user} logoutButton={logoutButton} />

        {/* Main Content */}
        <main className="container max-w-7xl mx-auto px-4 pt-2 pb-28 flex-1 relative">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t bg-muted/30 py-6 mt-auto">
          <div className="container max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-center md:justify-start">
              <p className="text-sm text-muted-foreground">
                © 2025 TechClip. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </SearchProvider>
  )
}
