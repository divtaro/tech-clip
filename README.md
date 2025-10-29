# TechClip

技術記事の積読管理アプリ - 複数プラットフォームの記事を一元管理

## 📖 概要

TechClipは、Qiita、Zenn、noteなど、複数のプラットフォームに散らばる技術記事を一元管理し、読書進捗を追跡できるWebアプリケーションです。

## ✨ 主な機能

- 🔐 **Google OAuth認証** - 安全なログイン
- 📝 **記事登録** - URL入力で自動OGP取得
- 📊 **ステータス管理** - 読みたい / 読んでいる / 読んだ
- 🔍 **検索・フィルタリング** - 記事を素早く検索
- ✏️ **メモ機能** - 記事に対してメモを追加
- 🗑️ **編集・削除** - 記事情報の更新と削除
- 📱 **レスポンシブ対応** - スマホ・タブレット・PC対応
- 🌓 **ダークモード** - 目に優しい表示

## 🛠️ 技術スタック

### Frontend
- **Next.js 14+** (App Router)
- **TypeScript** 5.9
- **TailwindCSS** 4.1
- **shadcn/ui** - UIコンポーネントライブラリ

### Backend
- **Next.js Server Actions**
- **Prisma ORM** 6.17
- **PostgreSQL** (Supabase)

### Authentication
- **NextAuth.js v5**

### Deployment
- **Vercel**

## 🚀 セットアップ

### 必要な環境

- Node.js 20.19.5以上
- npm 10.0.0以上

### 1. リポジトリのクローン
```bash
git clone https://github.com/yourusername/tech-clip.git
cd tech-clip
```

### 2. 依存関係のインストール
```bash
npm install
```

### 3. Docker Composeでデータベースを起動

開発環境ではDocker ComposeでPostgreSQLを使用します。

```bash
docker compose up -d
```

### 4. 環境変数の設定

`.env.local`ファイルを作成し、以下を設定：
```env
# Database（開発環境用 - Docker Compose）
DATABASE_URL="postgresql://postgres:password@localhost:5432/techclip"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="openssl rand -base64 32で生成"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

詳細は`.env.example`を参照してください。

### 5. データベースのセットアップ
```bash
# Prisma Clientの生成
npx prisma generate

# マイグレーションの実行
npx prisma migrate dev
```

### 6. 開発サーバーの起動
```bash
npm run dev
```

ブラウザで http://localhost:3000 にアクセス

## 🔑 Google OAuth設定

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成
3. 「APIとサービス」 → 「認証情報」
4. 「認証情報を作成」 → 「OAuthクライアントID」を選択
5. 承認済みのリダイレクトURIに以下を追加：
   - 開発環境: `http://localhost:3000/api/auth/callback/google`
   - 本番環境: `https://your-domain.vercel.app/api/auth/callback/google`
6. クライアントIDとシークレットを`.env.local`に設定

## 📦 主要コマンド
```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm run start

# TypeScriptの型チェック
npm run type-check

# ESLintチェック
npm run lint

# Prisma Studio（データベースGUI）
npm run db:studio

# マイグレーション実行
npm run db:migrate
```

## 📦 データベース管理

このプロジェクトは開発環境と本番環境で同じPostgreSQLを使用します。

- **開発環境**: Docker ComposeでローカルPostgreSQL
- **本番環境**: Supabase PostgreSQL

### Dockerコンテナの管理

```bash
# データベース起動
docker compose up -d

# データベース停止
docker compose down

# データベース削除（データも削除）
docker compose down -v
```

## 🌐 デプロイ

### Vercelへのデプロイ

1. [Vercel](https://vercel.com/) にログイン
2. GitHubリポジトリをインポート
3. 環境変数を設定
4. デプロイ実行

### 環境変数（本番環境）
```env
DATABASE_URL=postgres://...（Supabase接続文字列）
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=本番用シークレット
GOOGLE_CLIENT_ID=本番用クライアントID
GOOGLE_CLIENT_SECRET=本番用シークレット
```

詳細なデプロイ手順は[DEPLOYMENT.md](./DEPLOYMENT.md)を参照してください。

## 📁 プロジェクト構造
```
tech-clip/
├── prisma/
│   ├── schema.prisma          # データベーススキーマ
│   └── migrations/            # マイグレーションファイル
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/        # ログインページ
│   │   ├── dashboard/        # ダッシュボード
│   │   │   ├── articles/[id]/ # 記事詳細
│   │   │   └── page.tsx      # 記事一覧
│   │   ├── api/
│   │   │   ├── auth/         # NextAuth.js
│   │   │   └── ogp/          # OGP取得API
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/               # shadcn/ui
│   │   ├── article-card.tsx
│   │   ├── article-create-modal.tsx
│   │   └── ...
│   ├── lib/
│   │   ├── auth.ts           # NextAuth設定
│   │   └── prisma.ts         # Prisma Client
│   ├── actions/
│   │   └── article-actions.ts # Server Actions
│   └── types/
│       └── next-auth.d.ts
├── middleware.ts              # 認証ミドルウェア
├── .env.example              # 環境変数テンプレート
└── package.json
```

## 🤝 コントリビューション

Issue、Pull Requestは大歓迎です。

## 📝 ライセンス

MIT License

詳細は[LICENSE](./LICENSE)ファイルを参照してください。

## 👤 作成者

[@divtaro](https://github.com/divtaro)

---

**TechClip** - あなたの技術記事を、もっとスマートに管理