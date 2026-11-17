import { defineConfig, devices } from "@playwright/test"

const PORT = 3100
const baseURL = `http://localhost:${PORT}`

// E2Eは外部サービス(DB/Google/Supabase)に依存しないダミー値で起動する
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: `${baseURL}/login`,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    env: {
      DATABASE_URL: "postgresql://e2e:e2e@localhost:5432/e2e",
      AUTH_SECRET: "e2e-dummy-secret-not-for-production",
      AUTH_URL: baseURL,
      AUTH_TRUST_HOST: "true",
      // ローカルの.envにBasic認証が設定されていても無効化する
      BASIC_AUTH_USER: "",
      BASIC_AUTH_PASSWORD: "",
      GOOGLE_CLIENT_ID: "e2e-dummy-client-id",
      GOOGLE_CLIENT_SECRET: "e2e-dummy-client-secret",
      NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "e2e-dummy-anon-key",
    },
  },
})
