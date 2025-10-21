# TechClip

技術記事の積読管理アプリケーション

## 技術スタック

- Next.js 14+ (App Router)
- TypeScript
- TailwindCSS
- Prisma
- NextAuth.js v5
- shadcn/ui

## 開発環境

- Node.js v20.19.5
- 開発時はSQLite、本番はSupabaseを想定

## セットアップ

1. 依存関係のインストール:
```bash
npm install
```

2. 環境変数の設定:
`.env.local`ファイルのコメントを外して、必要な値を設定してください。

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

3. Prismaのセットアップ（次のステップで実施）:
```bash
npx prisma generate
npx prisma migrate dev
```

## 開発

開発サーバーの起動:
```bash
npm run dev
```

型チェック:
```bash
npm run type-check
```

ビルド:
```bash
npm run build
```

## プロジェクト構造

```
tech_clip/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/             # Reactコンポーネント
│   │   └── ui/                # shadcn/uiコンポーネント
│   └── lib/                   # ユーティリティ関数
├── prisma/                    # Prismaスキーマ（次のステップで作成）
├── components.json            # shadcn/ui設定
└── package.json
```

## インストール済みパッケージ

### 主要パッケージ
- next@15.5.6
- react@19.2.0
- typescript@5.9.3
- tailwindcss@4.1.15

### UI関連
- shadcn/ui コンポーネント (button, card, input, textarea, dialog, select, dropdown-menu, badge)
- lucide-react
- @radix-ui/react-*

### バックエンド
- @prisma/client@6.17.1
- next-auth@5.0.0-beta.29
- zod@4.1.12

### ユーティリティ
- cheerio (OGP取得用)
- react-hot-toast
- use-debounce

## 次のステップ

1. Prismaスキーマの設計と実装
2. NextAuth.jsの設定
3. データベースモデルの作成
4. 認証機能の実装
5. 記事管理機能の実装
