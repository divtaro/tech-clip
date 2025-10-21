import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Status = "TO_READ" | "READING" | "COMPLETED"

interface StatusBadgeProps {
  status: Status
  className?: string
}

const statusConfig = {
  TO_READ: {
    label: "読みたい",
    className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900",
  },
  READING: {
    label: "読んでいる",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900",
  },
  COMPLETED: {
    label: "読んだ",
    className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900",
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge
      variant="secondary"
      className={cn(config.className, "text-xs", className)}
    >
      {config.label}
    </Badge>
  )
}
