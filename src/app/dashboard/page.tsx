import { auth, signOut } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function DashboardPage() {
  const session = await auth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            TechClip Dashboard
          </h1>
          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: "/login" })
            }}
          >
            <Button type="submit" variant="outline">
              ログアウト
            </Button>
          </form>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>ようこそ！</CardTitle>
            <CardDescription>認証に成功しました</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">ユーザー名</p>
              <p className="text-lg">{session?.user?.name || "未設定"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">メールアドレス</p>
              <p className="text-lg">{session?.user?.email || "未設定"}</p>
            </div>
            {session?.user?.image && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">プロフィール画像</p>
                <img
                  src={session.user.image}
                  alt="Profile"
                  className="w-16 h-16 rounded-full"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
