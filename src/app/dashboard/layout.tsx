import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardLayoutClient } from "@/components/dashboard-layout-client"
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
    <DashboardLayoutClient
      user={{
        name: session.user?.name,
        email: session.user?.email,
        image: session.user?.image,
      }}
      logoutButton={<LogoutButton />}
    >
      {children}
    </DashboardLayoutClient>
  )
}
