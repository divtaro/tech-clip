"use client"

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { DashboardSearchBar } from "@/components/dashboard-search-bar"
import { ThemeSwitcher } from "@/components/theme-switcher"

interface DashboardHeaderProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  logoutButton: React.ReactNode
}

export function DashboardHeader({ user, logoutButton }: DashboardHeaderProps) {
  return (
    <header className="w-full bg-background">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Top Row: Logo and User Controls */}
        <div className="flex h-16 items-center justify-between">
          {/* Logo - クリック可能 */}
          <Link href="/dashboard" className="flex items-center gap-8">
            <h1 className="text-xl font-bold hover:opacity-80 transition-opacity cursor-pointer text-blue-600 dark:text-blue-400">
              TechClip
            </h1>
          </Link>

          {/* Center Search - PC only */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <DashboardSearchBar />
          </div>

          {/* Theme Switcher and User Dropdown */}
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                    <AvatarFallback delayMs={600}>
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-32" align="end" forceMount>
                {logoutButton}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Search Bar - below logo row */}
        <div className="md:hidden pb-1">
          <DashboardSearchBar />
        </div>
      </div>
    </header>
  )
}
