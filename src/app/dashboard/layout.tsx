import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { LogoutButton } from "./logout-button"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <DashboardHeader
        user={{
          name: session.user?.name,
          email: session.user?.email,
          image: session.user?.image,
        }}
        logoutButton={<LogoutButton />}
      />

      {/* Main Content */}
      <main className="container max-w-7xl mx-auto px-4 pt-2 pb-6 flex-1">
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
  )
}
