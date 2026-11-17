import { test, expect } from "@playwright/test"

test.describe("未ログイン時の導線", () => {
  test("トップページはログインページへリダイレクトされる", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveURL(/\/login$/)
  })

  test("ダッシュボードはログインページへリダイレクトされる", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page).toHaveURL(/\/login$/)
  })

  test("記事詳細ページもログインページへリダイレクトされる", async ({ page }) => {
    await page.goto("/dashboard/articles/abc")
    await expect(page).toHaveURL(/\/login$/)
  })
})

test.describe("ログインページ", () => {
  test("タイトル・説明・Googleログインボタンが表示される", async ({ page }) => {
    await page.goto("/login")
    await expect(page.getByText("TechClip", { exact: true })).toBeVisible()
    await expect(page.getByText("技術記事を積読しよう")).toBeVisible()
    await expect(page.getByRole("button", { name: "Googleでログイン" })).toBeVisible()
  })

  test("Googleログインボタンで認証フローが開始される", async ({ page }) => {
    // 初回は/api/authのオンデマンドコンパイルがあるため時間に余裕を持たせる
    test.slow()
    await page.goto("/login")
    // ハイドレーション前のクリックを避ける
    await page.waitForLoadState("networkidle")
    // 実際のGoogleへは遷移させず、リダイレクト先だけ検証する
    await page.route("https://accounts.google.com/**", (route) =>
      route.fulfill({ status: 200, contentType: "text/html", body: "stub" }),
    )
    await Promise.all([
      page.waitForURL(/accounts\.google\.com/),
      page.getByRole("button", { name: "Googleでログイン" }).click(),
    ])
    expect(page.url()).toContain("accounts.google.com")
  })
})
