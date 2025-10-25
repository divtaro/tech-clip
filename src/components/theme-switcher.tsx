"use client"

import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { CheckIcon } from "@radix-ui/react-icons"

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <div className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          {theme === "light" ? (
            <Sun className="h-5 w-5" />
          ) : theme === "dark" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Monitor className="h-5 w-5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        <DropdownMenuItem onClick={() => setTheme("light")} className="relative pr-8">
          <Sun className="mr-2 h-4 w-4" />
          ライト
          {theme === "light" && (
            <CheckIcon className="absolute right-2 h-4 w-4" style={{ color: 'hsl(var(--primary))' }} />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="relative pr-8">
          <Moon className="mr-2 h-4 w-4" />
          ダーク
          {theme === "dark" && (
            <CheckIcon className="absolute right-2 h-4 w-4" style={{ color: 'hsl(var(--primary))' }} />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="relative pr-8">
          <Monitor className="mr-2 h-4 w-4" />
          システム
          {theme === "system" && (
            <CheckIcon className="absolute right-2 h-4 w-4" style={{ color: 'hsl(var(--primary))' }} />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
