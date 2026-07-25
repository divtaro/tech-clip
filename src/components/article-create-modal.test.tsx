import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {
  ArticleCreateModal,
  normalizeUrl,
  isValidUrl,
} from "./article-create-modal"

vi.mock("@/actions/article-actions", () => ({
  createArticle: vi.fn(),
}))

describe("normalizeUrl", () => {
  it("前後の空白を削除する", () => {
    expect(normalizeUrl("  https://example.com  ")).toBe(
      "https://example.com"
    )
  })

  it("全角英数字を半角に変換する", () => {
    expect(normalizeUrl("https://ｅｘａｍｐｌｅ.com")).toBe(
      "https://example.com"
    )
  })

  it("全角スラッシュ・コロン・ドットを半角に変換する", () => {
    expect(normalizeUrl("https：／／example．com")).toBe(
      "https://example.com"
    )
  })
})

describe("isValidUrl", () => {
  it("空文字は無効", () => {
    expect(isValidUrl("")).toBe(false)
    expect(isValidUrl("   ")).toBe(false)
  })

  it("http/httpsのURLは有効", () => {
    expect(isValidUrl("https://example.com/article")).toBe(true)
    expect(isValidUrl("http://example.com")).toBe(true)
  })

  it("http/https以外のプロトコルは無効", () => {
    expect(isValidUrl("ftp://example.com")).toBe(false)
    expect(isValidUrl("javascript:alert(1)")).toBe(false)
  })

  it("日本語ドメインは無効", () => {
    expect(isValidUrl("https://例え.com")).toBe(false)
  })

  it("パスに全角文字を含む場合は無効", () => {
    expect(isValidUrl("https://example.com/記事")).toBe(false)
  })

  it("クエリに全角文字を含む場合は無効", () => {
    expect(isValidUrl("https://example.com/article?q=検索")).toBe(false)
  })

  it("不正な形式のURLは無効", () => {
    expect(isValidUrl("not a url")).toBe(false)
  })
})

describe("ArticleCreateModal 貼り付けボタン", () => {
  beforeEach(() => {
    vi.stubGlobal("navigator", {
      ...navigator,
      clipboard: {
        readText: vi.fn(),
      },
    })
  })

  it("URLが未入力のとき貼り付けボタンが表示される", () => {
    render(<ArticleCreateModal open={true} onOpenChange={vi.fn()} />)
    expect(
      screen.getByRole("button", { name: "クリップボードから貼り付け" })
    ).toBeInTheDocument()
  })

  it("貼り付けボタンをクリックするとクリップボードのテキストが入力欄にセットされる", async () => {
    const readText = navigator.clipboard.readText as ReturnType<typeof vi.fn>
    readText.mockResolvedValue("https://example.com/article")

    render(<ArticleCreateModal open={true} onOpenChange={vi.fn()} />)

    const pasteButton = screen.getByRole("button", {
      name: "クリップボードから貼り付け",
    })
    await userEvent.click(pasteButton)

    await waitFor(() => {
      expect(screen.getByDisplayValue("https://example.com/article")).toBeInTheDocument()
    })
  })

  it("URL入力後は貼り付けボタンが非表示になり、クリアボタンが表示される", async () => {
    const readText = navigator.clipboard.readText as ReturnType<typeof vi.fn>
    readText.mockResolvedValue("https://example.com/article")

    render(<ArticleCreateModal open={true} onOpenChange={vi.fn()} />)

    const pasteButton = screen.getByRole("button", {
      name: "クリップボードから貼り付け",
    })
    await userEvent.click(pasteButton)

    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: "クリップボードから貼り付け" })
      ).not.toBeInTheDocument()
    })
    expect(screen.getByRole("button", { name: "クリア" })).toBeInTheDocument()
  })

  it("クリップボード読み取りに失敗してもエラーにならない", async () => {
    const readText = navigator.clipboard.readText as ReturnType<typeof vi.fn>
    readText.mockRejectedValue(new DOMException("denied", "NotAllowedError"))

    render(<ArticleCreateModal open={true} onOpenChange={vi.fn()} />)

    const pasteButton = screen.getByRole("button", {
      name: "クリップボードから貼り付け",
    })
    await userEvent.click(pasteButton)

    await waitFor(() => {
      expect(readText).toHaveBeenCalled()
    })
    // URLは入力されないまま
    expect(screen.getByPlaceholderText("https://example.com/article")).toHaveValue("")
  })
})
