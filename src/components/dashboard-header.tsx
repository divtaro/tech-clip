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
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo - クリック可能 */}
        <Link href="/dashboard" className="flex items-center gap-8">
          <h1 className="text-xl font-bold hover:opacity-80 transition-opacity cursor-pointer text-blue-600 dark:text-blue-400">
            TechClip
          </h1>
        </Link>

        {/* Center Search */}
        <div className="flex flex-1 max-w-md mx-4">
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
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.name || "ユーザー"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {logoutButton}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
