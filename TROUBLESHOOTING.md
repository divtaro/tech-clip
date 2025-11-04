# TechClip トラブルシューティングガイド

## 📋 目次

- [環境情報](#環境情報)
- [セットアップ概要](#セットアップ概要)
- [エラー解決ガイド](#エラー解決ガイド)
  - [1. データベース接続](#1-データベース接続)
  - [2. Prismaマイグレーション](#2-prismaマイグレーション)
  - [3. 環境変数・設定](#3-環境変数設定)
  - [4. Basic認証・Middleware](#4-basic認証middleware)
  - [5. Vercelデプロイ](#5-vercelデプロイ)
  - [6. 開発環境](#6-開発環境)
- [FAQ](#faq)
- [参考コマンド集](#参考コマンド集)
- [チェックリスト](#チェックリスト)

---

## 🔧 環境情報

### 技術スタック
- **Next.js**: 15.5.6 (App Router)
- **React**: 19.2.0
- **NextAuth.js**: 5.0.0-beta.29
- **Prisma**: 6.17.1
- **PostgreSQL**: Docker Compose / Supabase
- **Node.js**: 推奨 v18以上

### プロジェクト構造
```
tech_clip/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   └── layout.tsx  # NextAuth認証チェック
│   │   └── (auth)/
│   ├── lib/
│   │   └── auth.ts
│   ├── middleware.ts       # Basic認証（ここに配置）
│   └── components/
├── prisma/
│   ├── schema.prisma       # PostgreSQL用
│   └── migrations/
├── .env.local              # 環境変数（Git管理外）
└── package.json
```

---

## 📚 セットアップ概要

TechClipプロジェクトでは、2段階の認証を実装しています：

1. **Basic認証**: middleware.tsで実装（開発環境保護）
2. **NextAuth.js認証**: dashboard/layout.tsxで実装（ユーザー認証）

認証フロー:
```
ユーザーアクセス
    ↓
middleware.ts（Basic認証）
    ↓ 認証成功
アプリケーション
    ↓
dashboard/layout.tsx（NextAuth.js認証）
    ↓ 認証成功
ダッシュボード表示
```

---

## 🚨 エラー解決ガイド

### 1. データベース接続

#### 1-1. データベースパスワードの特殊文字エラー

**エラーコード**: なし
**発生タイミング**: 初回デプロイ時、Vercel環境変数設定後

**症状**
- Vercelデプロイ後、ログイン試行時にエラーが発生
- Supabaseへの接続ができない

**エラーメッセージ**
```
[auth][error] AdapterError
[auth][cause] PrismaClientInitializationError:
Authentication failed against database server,
the provided database credentials for `postgres` are not valid.
```

**原因**
- Supabaseで生成されたパスワードに特殊文字（`#`、`!`、`&`、`@`等）が含まれていた
- DATABASE_URLに特殊文字がそのまま含まれ、URLとして正しくパースされなかった
- 特殊文字がURL内で別の意味として解釈された:
  - `#` → フラグメント識別子
  - `&` → クエリパラメータの区切り
  - `@` → ユーザー名とホストの区切り

**解決手順**

1. **Supabaseでパスワードをリセット**:
```
Supabase Dashboard
→ Project Settings
→ Database
→ "Reset Database Password"
```

2. **英数字のみのパスワードを生成**:
   - "Generate a password" ボタンをクリック
   - 生成されたパスワードに特殊文字が含まれていないことを確認
   - ⚠️ 特殊文字が含まれている場合は、再生成を繰り返す

3. **パスワードを保存**:
   - メモ帳やパスワードマネージャーに保存

4. **パスワードを適用**:
   - "Update password" をクリック

5. **接続文字列を作成**:
```
postgresql://postgres.[PROJECT_ID]:[PASSWORD]@[HOST]:6543/postgres?pgbouncer=true
```

6. **ローカルでテスト**:
```bash
DATABASE_URL="接続文字列" npx prisma db push
```

7. **Vercel環境変数を更新**:
   - Vercel Dashboard → Settings → Environment Variables
   - `DATABASE_URL` を更新
   - 全環境（Production, Preview, Development）に適用

8. **再デプロイ**

**確認方法**
- ✅ ローカルで `npx prisma db push` が成功
- ✅ Vercelデプロイが成功
- ✅ ログイン機能が正常に動作

**予防策**
- ⚠️ パスワード生成時は必ず英数字のみを使用
- 💡 URLエンコードは複雑になるため推奨しない
- 💡 パスワードマネージャーに記録して管理

**関連ファイル**
- Vercel環境変数: `DATABASE_URL`
- Supabase Project Settings → Database

---

### 7. ブラウザ・UI

#### 7-1. iOSで下端到達時に最上部へ戻る／スクロールがガタつく

**エラーコード**: なし  
**発生タイミング**: iPhone（Safari/Chrome）でダッシュボードを最下部までスクロールしたとき

**症状**
- 最下部到達時にページが「ガタン」と揺れるように感じる
- 場合によっては最上部に戻ってしまう（初期状態）
- 上端のプル・トゥ・リフレッシュ（PTR）を使いたい

**原因**
- iOS WebKitのスクロール実装起因の既知挙動
  - `html`をスクロールコンテナにすると、`position: fixed`/`sticky`やアドレスバー表示・非表示による動的ビューポート変化と干渉しやすい
  - 下端・上端到達時のオーバースクロール（バウンス）でレイアウト再計算が起きやすい

**対策（本プロジェクトで採用）**
1. スクロールコンテナを`body`に変更（`html`は高さ指定のみ）
   - `src/app/globals.css`:77, 82
     - `html { height: 100% }`
     - `body { overflow-y: auto; -webkit-overflow-scrolling: touch }`
2. 自然なオーバースクロールとPTRは許容（`overscroll-behavior`や`touch-action`での抑止はしない）
3. ルートラッパーの高さを安定化し、下端干渉を避ける余白を確保
   - `src/components/dashboard-layout-client.tsx`:24, 29
     - `min-h-[100dvh]` を付与
     - `main` に `pb-28` を付与
4. 小画面ではタブの`sticky`を無効化（中画面以上のみ`sticky`）
   - `src/components/dashboard-client.tsx`:89
     - タブラッパーに `md:sticky top-0`
5. FAB（追加ボタン）はセーフエリアを考慮した固定配置
   - `src/components/dashboard-client.tsx`:171-177
     - `position: fixed; bottom: calc(env(safe-area-inset-bottom, 0px) + 2rem)`

**確認方法**
- iPhone実機でダッシュボードを下端まで素早くスクロール
  - ✅ 最上部へ戻らない
  - ✅ 上端でPTRが使用できる
  - ⭕ 下端でのわずかなバウンス感はiOS仕様により残る場合あり（Qiita/Zennでも確認される一般的な挙動）

**備考（トレードオフ）**
- 端での「ガタン」感をさらに減らすには、ダッシュボードを「内部スクロールコンテナ化」して`overscroll-behavior`を抑止する手もあるが、PTRが使えなくなるため採用せず。

**関連ファイル**
- `src/app/globals.css`:77, 82-90
- `src/components/dashboard-layout-client.tsx`:24, 29
- `src/components/dashboard-client.tsx`:89-144, 171-177


#### 1-2. データベース認証エラー（パスワード不一致）

**エラーコード**: P1000, P1001
**発生タイミング**: パスワード変更後、再デプロイ時

**症状**
- データベース接続が失敗する
- 接続文字列は正しいが認証エラーが出る

**エラーメッセージ**
```
[auth][error] AdapterError
[auth][cause] PrismaClientInitializationError:
Authentication failed against database server,
the provided database credentials for `postgres` are not valid.
```

**原因**
- VercelのDATABASE_URLに含まれるパスワードと、Supabaseの実際のパスワードが一致していない
- パスワードをSupabaseで変更したが、Vercelの環境変数を更新していない
- または、Vercelの環境変数を変更したが、Supabaseのパスワードと一致していない

**解決手順**

1. **Supabaseでパスワードを再生成**（英数字のみ）
2. **生成されたパスワードをメモ帳に保存**
3. **接続文字列を作成**:
```
postgresql://postgres.[PROJECT_ID]:[PASSWORD]@[HOST]:6543/postgres?pgbouncer=true
```

4. **ローカルでテスト接続**（重要）:
```bash
DATABASE_URL="接続文字列" npx prisma db push
```
成功メッセージが表示されることを確認:
```
Your database is now in sync with your schema.
```

5. **成功したらVercelの環境変数を更新**
6. **Vercelを再デプロイ**

**確認方法**
- ✅ ローカルで接続テストが成功
- ✅ Vercelデプロイが成功
- ✅ アプリケーションでログインできる

**予防策**
- ⚠️ パスワード変更時は必ずローカルで接続テストしてからVercelに設定
- 💡 パスワードを変更したら、両方の環境（SupabaseとVercel）を同時に更新
- 💡 パスワードを複数の場所（メモ帳、パスワードマネージャー）に記録

**関連ファイル**
- Vercel環境変数: `DATABASE_URL`
- Supabase Database Settings
- `.env.local`（ローカル開発用）

---

#### 1-3. Prismaマイグレーション未実行エラー

**エラーコード**: なし
**発生タイミング**: データベース接続成功後、ログイン試行時

**症状**
- データベース接続は成功するが、ログイン時にエラーが発生
- テーブルが存在しないというエラー

**エラーメッセージ**
```
[auth][error] AdapterError
[auth][cause] PrismaClientInitializationError:
Error querying the database: unexpected message from server
Invalid `prisma.account.findUnique()` invocation
```

または
```
The table `public.Account` does not exist in the current database.
```

**原因**
- Supabaseデータベースにテーブルが存在しない
- Prismaマイグレーションがまだ実行されていない
- アプリケーションがAccountテーブルにアクセスしようとしたが、テーブルが存在しない

**解決手順**

**方法A: `prisma db push`を使用（推奨）**
```bash
DATABASE_URL="本番用URL" npx prisma db push
```

成功メッセージ:
```
Your database is now in sync with your schema.
✔ Generated Prisma Client
```

**方法B: マイグレーションを実行**
```bash
DATABASE_URL="本番用URL" npx prisma migrate deploy
```

**方法C: Vercelで自動実行**

`package.json`のbuildスクリプトに追加:
```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

**テーブル作成の確認**

1. Supabase Dashboard → Table Editor
2. 以下のテーブルが作成されていることを確認:
   - ✅ User
   - ✅ Account
   - ✅ Session
   - ✅ VerificationToken
   - ✅ Article（カスタムテーブル）

**確認方法**
- ✅ `npx prisma db push` が成功
- ✅ Supabase Table Editorでテーブルが確認できる
- ✅ ログイン機能が正常に動作

**予防策**
- ⚠️ 初回デプロイ前に必ずマイグレーション実行
- 💡 `package.json`のbuildスクリプトにマイグレーションを含める
- 💡 Supabase Table Editorで定期的にテーブル存在を確認

**関連ファイル**
- `prisma/schema.prisma`
- `prisma/migrations/`
- `package.json`

---

#### 1-4. Docker PostgreSQL未起動エラー

**エラーコード**: なし
**発生タイミング**: ローカル環境でログイン試行時

**症状**
- ローカル環境でGoogleログインを試すとエラーが発生
- データベースサーバーに接続できない

**エラーメッセージ**
```
[auth][error] AdapterError: Read more at https://errors.authjs.dev#adaptererror
[auth][cause]: PrismaClientInitializationError:
Invalid `prisma.session.findUnique()` invocation:

Can't reach database server at `localhost:5432`

Please make sure your database server is running at `localhost:5432`.
```

**原因**
- Docker Desktopが起動していない
- Docker PostgreSQLコンテナが起動していない
- ポート5432でPostgreSQLが待ち受けていない

**解決手順**

1. **Dockerデーモンが起動しているか確認**:
```bash
docker ps
```

エラーが出る場合は、Docker Desktopを起動:
```bash
# macOSの場合
open -a Docker

# または、Applicationsフォルダから手動で起動
```

2. **Docker Desktopが起動するまで待つ**（メニューバーにアイコンが表示される）

3. **PostgreSQLコンテナを起動**:
```bash
docker-compose up -d
```

4. **コンテナの状態を確認**:
```bash
docker-compose ps
```

出力例（正常）:
```
NAME                IMAGE                COMMAND                  SERVICE    CREATED      STATUS         PORTS
techclip-postgres   postgres:15-alpine   "docker-entrypoint.s…"   postgres   2 days ago   Up 10 seconds  0.0.0.0:5432->5432/tcp
```

5. **データベースが同期されているか確認**（オプション）:
```bash
npx prisma db push
```

6. **開発サーバーを再起動**:
```bash
npm run dev
```

**確認方法**
- ✅ `docker ps` でPostgreSQLコンテナが表示される
- ✅ `lsof -i :5432` でポート5432が使用されている
- ✅ ログインが正常に動作する

**予防策**
- ⚠️ 開発開始時に必ずDockerを起動
- 💡 `package.json`にpredevスクリプトを追加して自動起動

**package.jsonに自動起動を追加（推奨）**:
```json
{
  "scripts": {
    "predev": "docker-compose up -d",
    "dev": "next dev"
  }
}
```

これで、`npm run dev`を実行すると自動的にDockerコンテナが起動します。

**関連ファイル**
- `docker-compose.yml`
- `.env.local`
- `package.json`

**参考コマンド**
```bash
# Dockerの状態確認
docker ps

# PostgreSQLコンテナのみ確認
docker-compose ps

# コンテナのログを確認
docker-compose logs postgres

# コンテナを停止
docker-compose down

# コンテナを再起動
docker-compose restart
```

---

### 2. Prismaマイグレーション

#### 2-1. Prismaマイグレーションプロバイダー不一致エラー（P3019）

**エラーコード**: P3019
**発生タイミング**: `npx prisma migrate deploy` 実行時

**症状**
- マイグレーションの実行が失敗する
- プロバイダーの不一致エラーが表示される

**エラーメッセージ**
```
Error: P3019
The datasource provider `postgresql` specified in your schema
does not match the one specified in the migration_lock.toml, `sqlite`.
Please remove your current migration directory and start a new
migration history with prisma migrate dev.
```

**原因**
- 開発環境でSQLiteを使用してマイグレーションを作成
- `prisma/migrations/migration_lock.toml` に `provider = "sqlite"` が記録された
- 本番環境（PostgreSQL）でマイグレーションを実行しようとした
- プロバイダーが一致しないため実行できない

**背景**
- プロジェクトは開発環境（SQLite）と本番環境（PostgreSQL）で異なるDBを使用
- `schema.dev.prisma` (SQLite用) と `schema.prod.prisma` (PostgreSQL用) を切り替える設計
- マイグレーション履歴は作成時のプロバイダーに固定される

**解決手順**

**方法A: `prisma db push`を使用（推奨・簡単）**
```bash
DATABASE_URL="postgresql://..." npx prisma db push
```

メリット:
- ✅ マイグレーション履歴不要
- ✅ 開発・本番で異なるDBを使える
- ✅ プロバイダー不一致の問題が発生しない

デメリット:
- ⚠️ マイグレーション履歴が残らない
- ⚠️ ロールバックができない

**方法B: マイグレーション履歴を再生成**
```bash
# 既存履歴を削除
rm -rf prisma/migrations

# PostgreSQL用の新しい履歴を作成
DATABASE_URL="postgresql://..." npx prisma migrate dev --name init
```

**方法C: 開発環境もPostgreSQLに統一（根本解決）**
```bash
# Docker PostgreSQLを開発環境でも使用
docker-compose up -d

# .env.localを更新
DATABASE_URL="postgresql://postgres:password@localhost:5432/techclip"

# マイグレーション履歴を再生成
rm -rf prisma/migrations
npx prisma migrate dev --name init
```

**確認方法**
- ✅ マイグレーションが成功する
- ✅ テーブルが正しく作成される
- ✅ 開発・本番環境の両方で動作する

**予防策**
- 🎯 開発・本番環境で同じDBプロバイダーを使用（推奨）
- 🎯 Docker PostgreSQLを開発環境でも使用
- 💡 `prisma db push`を使用してマイグレーション履歴を避ける

**関連ファイル**
- `prisma/migrations/migration_lock.toml`
- `prisma/schema.prisma`
- `.env.local`

---

#### 2-2. migration_lock.tomlの仕組みと制限

**誤解**
「`migration_lock.toml`のproviderを環境変数で切り替えられる」

**実際**
- ❌ `migration_lock.toml`は静的ファイルで、環境変数で動的に切り替えることは不可能
- ❌ providerの値は固定され、実行時に変更されない
- ✅ マイグレーション履歴は作成時のプロバイダー専用

**理由**

1. **マイグレーション履歴の一貫性**
   - SQLiteとPostgreSQLではSQL文法が異なる
   - データ型が異なる（TEXT vs VARCHAR、INTEGER vs BIGINTなど）
   - 制約の書き方が異なる

2. **Prismaの設計思想**
   - 1つのマイグレーション履歴は1つのDBプロバイダー専用
   - 異なるプロバイダー間でのマイグレーション履歴共有は危険
   - データ安全性を優先

**比較**

```typescript
// schema.prisma（動的）
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")  // ✅ 環境変数で切り替え可能
}
```

```toml
# migration_lock.toml（静的）
provider = "sqlite"  # ❌ 固定値、切り替え不可
```

**解決策**
- 開発・本番環境でプロバイダーを統一する（Docker PostgreSQL）
- または`prisma db push`を使用してマイグレーション履歴を使わない

**関連情報**
- [Prisma Migrate Limitations](https://www.prisma.io/docs/concepts/components/prisma-migrate/migrate-development-production#limitations)

---

#### 2-3. schema.dev.prismaとschema.prod.prismaの必要性

**質問**
「Docker環境ではschema.dev.prismaとschema.prod.prismaの両方が必要か？」

**答え**
❌ 不要です。開発・本番ともにPostgreSQLを使うため、1つの`schema.prisma`で十分。

**理由**
- 開発環境: Docker PostgreSQL
- 本番環境: Supabase PostgreSQL
- 両方とも `provider = "postgresql"`
- プロバイダーが統一されているため分ける必要がない

**推奨構成**

変更前（複雑）:
```
prisma/
├── schema.dev.prisma    # SQLite用
├── schema.prod.prisma   # PostgreSQL用
└── schema.prisma        # 自動生成（Git管理外）
```

変更後（シンプル）:
```
prisma/
├── schema.prisma        # PostgreSQL用（Git管理）
└── migrations/          # マイグレーション履歴
```

**移行手順**

1. **古いファイルを削除**:
```bash
rm prisma/schema.dev.prisma
rm prisma/schema.prod.prisma
```

2. **package.jsonのスクリプトを簡略化**:

変更前:
```json
{
  "scripts": {
    "dev": "npm run prisma:dev && next dev",
    "build": "npm run prisma:prod && next build",
    "prisma:dev": "cp prisma/schema.dev.prisma prisma/schema.prisma && prisma generate",
    "prisma:prod": "cp prisma/schema.prod.prisma prisma/schema.prisma && prisma generate"
  }
}
```

変更後:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

3. **.gitignoreから削除**:
```bash
# .gitignore から以下の行を削除
# prisma/schema.prisma
```

4. **Gitに追加**:
```bash
git add prisma/schema.prisma
git commit -m "chore: schema.prismaをGit管理に追加"
```

**メリット**
- ✅ ファイルが1つ（シンプル）
- ✅ コピー操作不要
- ✅ Git管理される（チームで共有しやすい）
- ✅ 標準的な構成

**デメリット**
- なし（プロバイダーが統一されている場合）

**関連ファイル**
- `prisma/schema.prisma`
- `package.json`
- `.gitignore`

---

#### 2-4. dev.dbファイルについて

**質問**
「`prisma/dev.db` とは何か？削除して良いか？」

**答え**
SQLiteのデータベースファイル。Docker PostgreSQLを使用する場合は削除OK。

**説明**
- `dev.db`: SQLiteのデータベースファイル
- 以前の開発環境でSQLiteを使っていた時のデータが保存されている
- バイナリファイル（テキストエディタでは開けない）

**確認方法**
```bash
# DATABASE_URLを確認
cat .env.local | grep DATABASE_URL

# postgresql:// なら削除OK
# file:./dev.db なら使用中（削除NG）
```

**削除手順**

1. **現在のDATABASE_URLを確認**:
```bash
echo $DATABASE_URL
# または
cat .env.local | grep DATABASE_URL
```

2. **PostgreSQLを使用している場合のみ削除**:
```bash
# dev.db を削除
rm prisma/dev.db

# 関連ファイルも削除
rm -f prisma/dev.db-journal
```

3. **確認**:
```bash
ls prisma/
# → schema.prisma と migrations/ だけ残る
```

**データの保存先（削除後）**
- **開発環境**: Docker PostgreSQL（Dockerボリューム `postgres-data/`）
- **本番環境**: Supabase PostgreSQL（クラウド）

**予防策**
- ⚠️ SQLiteを使用している場合は削除しない
- 💡 プロバイダーを確認してから削除

**関連ファイル**
- `prisma/dev.db`
- `prisma/dev.db-journal`
- `.env.local`

---

### 3. 環境変数・設定

#### 3-1. システム環境変数が`.env.local`より優先される

**症状**
- `.env.local`に`BASIC_AUTH_USER="tech-clip"`と設定しているのに、`admin`が読み込まれる
- console.logで確認すると、意図しない値が表示される

**エラーメッセージ**
```javascript
console.log(process.env.BASIC_AUTH_USER)
// 期待値: "tech-clip"
// 実際の値: "admin"
```

**発生条件**
- `~/.zshrc`や`~/.bashrc`などのシェル設定ファイルに環境変数が設定されている
- システム全体で環境変数がexportされている

**原因**
Next.jsの環境変数の読み込み優先順位:
```
1. システムの環境変数（~/.zshrc等）← 最優先
2. .env.local
3. .env.development / .env.production
4. .env
```

システム環境変数が設定されていると、`.env.local`の値は無視されます。

**解決手順**

1. **システム環境変数を確認**:
```bash
echo $BASIC_AUTH_USER
echo $BASIC_AUTH_PASSWORD
```

2. **設定されている場所を特定**:
```bash
grep -r "BASIC_AUTH" ~/.zshrc ~/.bashrc ~/.bash_profile ~/.zprofile
```

3. **該当行を削除**:
```bash
# 例: ~/.zshrcに設定されている場合
nano ~/.zshrc
# 以下の行を削除
# export BASIC_AUTH_USER='admin'
# export BASIC_AUTH_PASSWORD='1111'
```

4. **設定を反映**:
```bash
source ~/.zshrc
```

5. **VSCodeまたはターミナルを完全に再起動**

6. **確認**:
```bash
echo $BASIC_AUTH_USER
# 何も表示されなければOK
```

**確認方法**
- ✅ システム環境変数が未設定（echoで何も表示されない）
- ✅ 開発サーバー起動時に`.env.local`の値が読み込まれる

**予防策**
- ⚠️ プロジェクト固有の環境変数は、システム環境変数として設定しない
- 💡 プロジェクトごとに`.env.local`で管理するのがベストプラクティス
- 💡 チーム開発では`.env.example`を用意して、各自が`.env.local`を作成

**関連ファイル**
- `.env.local`
- `~/.zshrc` (macOS/Linux)
- `~/.bashrc` (Linux)
- `~/.bash_profile` (macOS)

---

#### 3-2. 現在のターミナルセッションに古い環境変数が残る

**症状**
- `~/.zshrc`から環境変数を削除したのに、まだ古い値が読み込まれる
- `source ~/.zshrc`を実行しても変わらない

**原因**
既に起動しているターミナルセッションやVSCodeのターミナルは、親プロセスから環境変数を引き継いでいるため、設定ファイルを変更しても即座には反映されません。

**解決手順**

**方法1: VSCodeを完全に再起動（最も確実）**
1. 開発サーバーを停止（Ctrl+C）
2. VSCodeを完全に終了
3. VSCodeを再度開く
4. ターミナルで`npm run dev`を実行

**方法2: 新しいターミナルウィンドウを開く**
1. Mac標準のターミナルアプリを新規に開く
2. プロジェクトディレクトリに移動:
```bash
cd /Users/username/projects/tech_clip
```
3. 環境変数を確認:
```bash
echo $BASIC_AUTH_USER
# 何も表示されなければOK
```
4. 開発サーバーを起動:
```bash
npm run dev
```

**方法3: 一時的に環境変数を上書き**
```bash
BASIC_AUTH_USER="tech-clip" BASIC_AUTH_PASSWORD='パスワード' npm run dev
```

**確認方法**
- ✅ 新しいターミナルで`echo $BASIC_AUTH_USER`が空
- ✅ 開発サーバーで正しい値が読み込まれている

**予防策**
- シェル設定ファイル（`.zshrc`等）を変更した場合は、必ずターミナルを再起動
- VSCode統合ターミナルではなく、新しいターミナルウィンドウで確認

---

#### 3-3. package.jsonスクリプトエラー

**エラーコード**: なし
**発生タイミング**: `npm run dev` 実行時

**症状**
- 開発サーバーの起動に失敗する
- ファイルが見つからないというエラーが表示される

**エラーメッセージ**
```
> tech_clip@0.1.0 prisma:dev
> cp prisma/schema.dev.prisma prisma/schema.prisma && prisma generate
cp: prisma/schema.dev.prisma: No such file or directory
```

**原因**
- `schema.dev.prisma`を削除したが、`package.json`のスクリプトが古いまま
- `npm run dev` が `prisma:dev` スクリプトを実行しようとする
- `prisma:dev` が存在しない `schema.dev.prisma` をコピーしようとする

**解決手順**

**package.json修正前**:
```json
{
  "scripts": {
    "dev": "npm run prisma:dev && next dev",
    "build": "npm run prisma:prod && next build",
    "prisma:dev": "cp prisma/schema.dev.prisma prisma/schema.prisma && prisma generate",
    "prisma:prod": "cp prisma/schema.prod.prisma prisma/schema.prisma && prisma generate"
  }
}
```

**package.json修正後**:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "next lint",
    "postinstall": "prisma generate",
    "db:studio": "prisma studio",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev"
  }
}
```

**変更内容**:
- ❌ `prisma:dev`、`prisma:prod` スクリプトを削除
- ✅ `dev` スクリプトを簡略化（直接 `next dev`）
- ✅ `postinstall` スクリプトを追加（依存関係インストール後に自動実行）
- ✅ データベース関連スクリプトを簡略化

**確認方法**
- ✅ `npm run dev` が成功する
- ✅ 開発サーバーが起動する

**予防策**
- ⚠️ ファイル削除時は関連スクリプトも確認・更新
- 💡 スクリプトの依存関係を把握
- 💡 削除前に`grep`でファイル名を検索

**関連ファイル**
- `package.json`

---

### 4. Basic認証・Middleware

#### 4-1. middlewareが実行されない

**症状**
- `http://localhost:3000`にアクセスしてもBasic認証ダイアログが表示されない
- console.logでログが出力されない
- すぐに`/login`にリダイレクトされる

**エラーメッセージ**
```
GET / 307 in 5740ms
GET /login 200 in 1810ms
```
（middlewareのログが全く出力されない）

**発生条件**
- `src/`ディレクトリ構造を使用しているのに、middleware.tsがルートディレクトリにある

**原因**
Next.jsでは、`src/`ディレクトリを使用している場合、middlewareも`src/`ディレクトリ内に配置する必要があります。ルートディレクトリに配置してもNext.jsが認識しません。

**解決手順**

1. **middleware.tsの場所を確認**:
```bash
ls -la middleware.ts
ls -la src/middleware.ts
```

2. **ルートディレクトリにある場合は、src/に移動**:
```bash
mv middleware.ts src/middleware.ts
```

3. **開発サーバーを再起動**:
```bash
npm run dev
```

4. **`http://localhost:3000`にアクセスして、Basic認証ダイアログが表示されることを確認**

**確認方法**
- ✅ ターミナルに`[Middleware] 実行されました`のようなログが表示される
- ✅ ブラウザでBasic認証ダイアログが表示される

**予防策**
- ⚠️ Next.jsプロジェクトで`src/`ディレクトリを使用する場合、middleware.tsは必ず`src/middleware.ts`に配置
- 💡 プロジェクト作成時に以下のどちらかに統一:
  - `src/`ディレクトリを使う → `src/middleware.ts`
  - `src/`ディレクトリを使わない → `middleware.ts`（ルート）

**関連ファイル**
- `src/middleware.ts`
- `src/app/`

---

#### 4-2. NextAuth.jsの`auth()`をmiddlewareでimportすると動作しない

**症状**
- `auth()`関数でラップしたmiddlewareを使うと、Basic認証より先にNextAuthが実行される
- Basic認証ダイアログが表示されず、いきなり`/login`にリダイレクトされる

**原因**
NextAuth.js v5 betaでは、`auth()`でmiddlewareをラップすると、NextAuthの認証チェックが最優先で実行されるため、Basic認証を先に実行できません。

**間違った実装例**
```typescript
import { auth } from '@/lib/auth'

// ❌ これだとNextAuthが先に実行される
export default auth((request) => {
  // Basic認証のコード
  // ここに到達する前にNextAuthが実行されてしまう
})
```

**正しい実装例**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

// ✅ 通常のasync関数として定義
export async function middleware(request: NextRequest) {
  // 1. Basic認証を先に実行
  if (process.env.BASIC_AUTH_USER && process.env.BASIC_AUTH_PASSWORD) {
    // Basic認証のチェック
  }

  // 2. その後にNextAuthのセッションチェック
  const session = await auth()

  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}
```

**解決手順**
1. `auth()`でラップする実装を削除
2. 通常のasync関数として定義
3. Basic認証を先に実行し、その後に`await auth()`を呼び出す

**予防策**
- NextAuth v5 betaでは、middlewareで`auth()`を使う場合は通常のasync関数として実装
- `export default auth(...)` の形式は使わない

---

#### 4-3. middlewareの配置場所の決定

**症状**
- middlewareがどこに配置すべきか分からない
- `middleware.ts`と`src/middleware.ts`のどちらを使うべきか迷う

**原因**
Next.jsのプロジェクト構造によって、middlewareの配置場所が異なります。

**正しい配置ルール**

| プロジェクト構造 | middlewareの配置場所 |
|----------------|---------------------|
| `src/`ディレクトリを使用 | `src/middleware.ts` |
| `src/`ディレクトリを使用しない | `middleware.ts`（ルート） |

**判定方法**
```bash
# src/app/ が存在するか確認
ls -la src/app/
# 存在する → src/middleware.ts に配置

# app/ が存在するか確認（ルートディレクトリ）
ls -la app/
# 存在する → middleware.ts に配置
```

**TechClipプロジェクトの場合**
```
tech_clip/
├── src/
│   ├── app/         # ← src/app/ が存在
│   └── middleware.ts # ← ここに配置
```

**解決手順**
1. プロジェクト構造を確認
2. `src/app/`が存在する場合は`src/middleware.ts`に配置
3. それ以外の場合はルートの`middleware.ts`に配置

**予防策**
- プロジェクト作成時に構造を統一
- `.gitignore`にmiddleware.tsが含まれていないことを確認

---

### 5. Vercelデプロイ

#### 5-1. Edge Functionのサイズ制限エラー

**症状**
- Vercelへのデプロイ時にビルドエラーが発生
- Edge Functionのサイズが1MBを超える

**エラーメッセージ**
```
Error: The Edge Function "src/middleware" size is 1 MB and your plan size limit is 1 MB.
Learn More: https://vercel.link/edge-function-size
```

**発生条件**
- middlewareでNextAuth.jsの`auth()`をimportしている
- middlewareで重いライブラリをimportしている

**原因**
Next.jsのmiddlewareはEdge Runtimeで実行されるため、サイズ制限（無料プランでは1MB）があります。NextAuth.jsの`auth()`関数をimportすると、多くの依存関係が含まれ、バンドルサイズが1MBを超えてしまいます。

**解決手順**

1. **middlewareからNextAuth.jsのimportを削除**

変更前（❌）:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth' // ← これが原因

export async function middleware(request: NextRequest) {
  // Basic認証のコード...

  // NextAuth.jsのセッションチェック
  const session = await auth() // ← サイズが大きい

  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}
```

変更後（✅）:
```typescript
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Basic認証のみを実行
  const basicUser = process.env.BASIC_AUTH_USER
  const basicPassword = process.env.BASIC_AUTH_PASSWORD

  if (basicUser && basicPassword) {
    const basicAuth = request.headers.get('authorization')

    if (!basicAuth) {
      return new NextResponse('Authentication required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Secure Area"',
        },
      })
    }

    try {
      const authValue = basicAuth.split(' ')[1]
      const [user, pwd] = atob(authValue).split(':')

      if (user !== basicUser || pwd !== basicPassword) {
        return new NextResponse('Invalid credentials', {
          status: 401,
          headers: {
            'WWW-Authenticate': 'Basic realm="Secure Area"',
          },
        })
      }
    } catch (error) {
      return new NextResponse('Invalid credentials', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Secure Area"',
        },
      })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

2. **NextAuth.jsの認証チェックをdashboard/layout.tsxで実行**

`src/app/dashboard/layout.tsx`:
```typescript
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

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
    <div>
      {/* Dashboard content */}
      {children}
    </div>
  )
}
```

3. **変更をコミット・プッシュ**
```bash
git add src/middleware.ts
git commit -m "fix(middleware): Edge Functionのサイズ制限エラーを修正"
git push
```

4. **Vercelで自動ビルドが成功することを確認**

**確認方法**
- ✅ Vercelのビルドログで`Build successful`と表示される
- ✅ デプロイされたサイトでBasic認証とNextAuth認証が両方動作する

**認証フロー（修正後）**
```
ユーザーアクセス
    ↓
middleware.ts（Basic認証のみ、軽量）
    ↓ 認証成功
/dashboardアクセス
    ↓
dashboard/layout.tsx（NextAuth.jsセッションチェック）
    ↓ セッションなし
/loginへリダイレクト
```

**予防策**
- ⚠️ middlewareでは最小限のコードのみを実行
- 💡 重い処理（DB接続、外部API呼び出し等）はmiddlewareで行わない
- 💡 認証チェックはlayout.tsxやサーバーコンポーネントで実施
- 🎯 middlewareはルーティング制御やリダイレクトなど軽量な処理に限定

**関連ファイル**
- `src/middleware.ts`
- `src/app/dashboard/layout.tsx`
- `src/lib/auth.ts`

**参考リンク**
- [Vercel Edge Function Size Limits](https://vercel.link/edge-function-size)
- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)

---

#### 5-2. Vercelドメインの再登録エラー

**症状**
- Vercelで一度削除したドメインを再登録しようとするとエラーが出る
- "The domain you are trying to add is invalid"というメッセージが表示される

**エラーメッセージ**
```
The domain you are trying to add is invalid, please enter a valid domain name and try again
```

**発生条件**
- Domainsページでドメインを削除した直後に、同じドメインを再登録しようとする

**原因**
- Vercel側でドメインの削除処理が完了していない（キャッシュ）
- DNSの伝播に時間がかかる
- プロジェクト名とドメイン名が一致していない

**解決手順**

**方法1: 時間を置く（推奨）**
1. 削除後、5-10分待つ
2. ブラウザのキャッシュをクリア
3. 再度ドメインを追加

**方法2: 入力内容を確認**
- ❌ `https://tech-clip.vercel.app`（プロトコル付き）
- ✅ `tech-clip.vercel.app`（ドメイン名のみ）
- 余分なスペースがないか確認

**方法3: プロジェクト名を確認**
1. Vercelダッシュボードで現在のプロジェクト名を確認
2. プロジェクト名が`tech-clip`であることを確認
3. `[プロジェクト名].vercel.app`の形式で登録

**方法4: 既存のドメインを確認**
1. Settings → Domains
2. 既存のドメインをすべて確認
3. 古いドメインが残っている場合は削除
4. ページをリロードして確認

**確認方法**
- ✅ Domainsページにドメインが表示される
- ✅ ドメインにアクセスしてBasic認証ダイアログが表示される

**予防策**
- ドメインを削除する前に、新しいドメインを先に追加してから古いものを削除
- 削除後は少し時間を置いてから再登録

---

### 6. 開発環境

#### 6-1. ngrokでのmiddlewareモジュールエラー

**エラーコード**: なし
**発生タイミング**: ngrok経由でモバイルデバイスからアクセスした時

**症状**
- スマホからngrok URLにアクセスすると「Cannot find the middleware module」エラーが表示される
- ローカル環境では正常に動作する
- middlewareファイルは存在している

**エラーメッセージ**
```
Error Type: Runtime Error
Error Message: Cannot find the middleware module
Next.js version: 15.5.6 (Webpack)
```

**原因**
1. **ポート番号の不一致**: ngrokが3000番ポートを指定しているが、開発サーバーが3001番ポートで起動している
2. **環境変数の未反映**: .env.localのNEXTAUTH_URLを更新したが、開発サーバーを再起動していない

**解決手順**

1. **現在のngrokプロセスを確認**:
```bash
ps aux | grep ngrok | grep -v grep
```

2. **使用中のポートを確認**:
```bash
lsof -i :3000
lsof -i :3001
```

3. **開発サーバーが使用しているポートを確認**:
```bash
# 開発サーバーのログで確認
# "Local: http://localhost:3001" と表示されているポートを確認
```

4. **ngrokを停止して正しいポートで再起動**:
```bash
# 既存のngrokプロセスを停止
pkill ngrok

# 開発サーバーが使用しているポート（例: 3001）でngrokを起動
ngrok http 3001
```

5. **ngrokのURLを確認**:
```bash
# ngrok APIから公開URLを取得
curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*"' | head -1
```

6. **.env.localのNEXTAUTH_URLを更新**:
```bash
# .env.local
NEXTAUTH_URL="https://your-generated-url.ngrok-free.dev"
```

7. **開発サーバーを再起動**（環境変数を反映させるため）:
```bash
# 既存の開発サーバーを停止（Ctrl+C または kill コマンド）
# 再起動
npm run dev
```

8. **スマホから新しいngrok URLにアクセス**

**確認方法**
- ✅ ngrokが正しいポート（開発サーバーと同じポート）にトンネリングされている
- ✅ .env.localのNEXTAUTH_URLがngrok URLに設定されている
- ✅ 開発サーバーが環境変数を読み込んで再起動された
- ✅ スマホからngrok URLにアクセスしてBasic認証ダイアログが表示される

**予防策**
- ⚠️ ngrok起動前に、開発サーバーが使用しているポート番号を確認
- 💡 ポート3000が使用中の場合は、事前に解放してから開発サーバーを起動
- 💡 .env.localを変更した後は必ず開発サーバーを再起動
- 💡 ngrok URLは起動のたびに変わるため、.env.localも合わせて更新

**ngrokのポート指定方法**
```bash
# 開発サーバーのポートに合わせる
ngrok http 3000  # 開発サーバーが3000で起動している場合
ngrok http 3001  # 開発サーバーが3001で起動している場合
```

**関連ファイル**
- `.env.local`
- `src/middleware.ts`

---

#### 6-2. ngrok経由でのGoogle OAuth認証リダイレクトエラー

**エラーコード**: なし
**発生タイミング**: ngrok経由でモバイルからGoogle OAuth認証を実行した時

**症状**
- スマホからngrok URLにアクセスできる
- Googleログインボタンをクリックして認証を完了
- 認証後に `localhost:3000` にリダイレクトされる
- スマホで「このサイトにアクセスできません」エラーが表示される
- 認証が完了しない

**エラーメッセージ**
```
このサイトにアクセスできません
localhost で接続が拒否されました。
ERR_CONNECTION_REFUSED
```

**原因**
1. **環境変数の設定不足**: NextAuth.js v5では `NEXTAUTH_URL` だけでなく `AUTH_URL` 環境変数も必要
2. **localhost参照の問題**: OAuthリダイレクトがlocalhost:3000を指しているため、モバイルデバイスから自分自身にアクセスしようとする

**技術的背景**
- NextAuth.js v5では `AUTH_URL` が主要な設定となり、`NEXTAUTH_URL` は後方互換性のために残されている
- モバイルデバイスの「localhost」は開発マシンではなく、モバイルデバイス自身を指す
- ngrokを使用する場合、OAuth認証のリダイレクトURLもngrokの公開URLにする必要がある

**解決手順**

1. **.env.localに `AUTH_URL` を追加**:
```bash
# .env.local
NEXTAUTH_URL="https://your-ngrok-url.ngrok-free.dev"
AUTH_URL="https://your-ngrok-url.ngrok-free.dev"  # ← これを追加
NEXTAUTH_SECRET="your-secret"
AUTH_SECRET="your-secret"
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

2. **開発サーバーを完全に再起動**（環境変数を反映させるため）:
```bash
# すべてのNext.jsプロセスを停止
lsof -ti:3000 | xargs kill -9

# 開発サーバーを再起動
npm run dev
```

3. **ngrokが正しく起動していることを確認**:
```bash
# ngrokプロセスを確認
ps aux | grep ngrok | grep -v grep

# 出力例: ngrok http 3000 が動作していることを確認
```

4. **Google Cloud Consoleの設定を確認**:
- Google Cloud Console → 認証情報 → OAuth 2.0 クライアントID
- 「承認済みのリダイレクトURI」に以下が登録されていることを確認:
  ```
  https://your-ngrok-url.ngrok-free.dev/api/auth/callback/google
  ```

5. **スマホから再度テスト**:
- ngrok URLにアクセス
- Googleログインを実行
- ngrok URLの `/dashboard` にリダイレクトされることを確認

**確認方法**
- ✅ `.env.local` に `AUTH_URL` が設定されている
- ✅ `AUTH_URL` の値がngrok URLになっている
- ✅ 開発サーバーが環境変数を読み込んで再起動された
- ✅ ngrokが正しいポート（3000）でトンネリングされている
- ✅ Google Cloud Consoleにngrok URLのリダイレクトURIが登録されている
- ✅ スマホからGoogle認証後、ngrok URLにリダイレクトされる

**予防策**
- ⚠️ NextAuth.js v5では必ず `AUTH_URL` を設定する（`NEXTAUTH_URL` だけでは不十分）
- 💡 ngrokを使用する場合は、`AUTH_URL` をngrok URLに設定
- 💡 .env.localを変更した後は必ず開発サーバーを再起動
- 💡 ngrok URLは起動のたびに変わるため、.env.localとGoogle Cloud Consoleの両方を更新

**NextAuth.js v5の環境変数**
```bash
# NextAuth.js v5で必要な環境変数
AUTH_URL="https://your-domain.com"           # 主要な設定（必須）
NEXTAUTH_URL="https://your-domain.com"       # 後方互換性のため（推奨）
AUTH_SECRET="your-secret"                    # 主要な設定（必須）
NEXTAUTH_SECRET="your-secret"                # 後方互換性のため（推奨）
```

**関連ファイル**
- `.env.local`
- `src/lib/auth.ts`
- Google Cloud Console OAuth設定

**参考リンク**
- [NextAuth.js v5 環境変数ドキュメント](https://authjs.dev/getting-started/deployment#environment-variables)

---

#### 6-3. Reactハイドレーションミスマッチエラー（Chrome拡張機能起因）

**エラーコード**: Console Error
**発生タイミング**: モバイルデバイス（特にChrome系ブラウザ）からアクセスした時

**症状**
- アプリケーションは正常に動作する
- コンソールにReactハイドレーションミスマッチの警告が表示される
- input要素に `__gchrome_uniqueid` などの属性が追加されている

**エラーメッセージ**
```
Error Type: Console Error
Error Message: A tree hydrated but some attributes of the server rendered HTML
didn't match the client properties. This won't be patched up.

  <input
    type="text"
    ...
-   __gchrome_uniqueid="1"
  >

Next.js version: 15.5.6
```

**原因**
1. **ブラウザ拡張機能の干渉**: Chrome系ブラウザの拡張機能（パスワードマネージャー、自動入力、翻訳など）がDOMに属性を追加
2. **サーバーとクライアントのHTML不一致**: サーバーレンダリングされたHTMLに拡張機能が追加した属性がないため、クライアント側でミスマッチが発生

**技術的背景**
- Reactのハイドレーションでは、サーバーレンダリングされたHTMLとクライアント側でレンダリングされるHTMLが完全に一致する必要がある
- ブラウザ拡張機能がReactのハイドレーション前にDOMを変更すると、この一致性が崩れる
- 特にモバイルChromeの自動入力機能や、パスワードマネージャー系の拡張機能が原因になることが多い

**対処方法**

**方法A: ユーザー側での対処（推奨）**

このエラーはアプリケーションの動作に影響を与えないため、以下のいずれかで対処できます:

1. **エラーを無視する**: アプリは正常に動作するため、特に対処不要
2. **ブラウザ拡張機能を無効化**:
   - Chrome設定 → 拡張機能 → 問題の原因となっている拡張機能を無効化
   - パスワードマネージャー、自動入力、翻訳系の拡張機能を確認

**方法B: 開発者側での対処（suppressHydrationWarning）**

特定のコンポーネントで警告を抑制する場合:

```tsx
// src/components/dashboard-search-bar.tsx
<input
  type="text"
  placeholder="検索"
  value={searchQuery}
  onChange={handleChange}
  suppressHydrationWarning  // ← 追加
  className="..."
/>
```

**注意**: `suppressHydrationWarning`は慎重に使用してください。実際のハイドレーションエラーを隠してしまう可能性があります。

**方法C: autocomplete属性の設定**

一部の自動入力機能を無効化する:

```tsx
<input
  type="text"
  placeholder="検索"
  autoComplete="off"  // ← 追加
  value={searchQuery}
  onChange={handleChange}
  className="..."
/>
```

**確認方法**
- ✅ アプリケーションが正常に動作している
- ✅ エラーがコンソールに表示されているが、機能には影響がない
- ✅ エラーメッセージに `__gchrome_uniqueid` などの拡張機能由来の属性が含まれている

**このエラーが実際の問題である場合**

以下の場合は、コードの問題である可能性があります:

- ❌ サーバーとクライアントで異なるランダム値を使用（`Math.random()`、`Date.now()`など）
- ❌ クライアント専用の条件分岐（`typeof window !== 'undefined'`）
- ❌ 無効なHTML構造（例: `<p>`の中に`<div>`など）

これらの場合は、コードの修正が必要です。

**予防策**
- 💡 開発環境では、ブラウザ拡張機能を無効にしたシークレットモードでテスト
- 💡 `suppressHydrationWarning`は、拡張機能が原因と確認できた場合のみ使用
- 💡 サーバーとクライアントで同じ値を使用するよう注意

**関連ファイル**
- `src/components/dashboard-search-bar.tsx`
- `src/components/ui/input.tsx`

**参考リンク**
- [React Hydration Mismatch ドキュメント](https://react.dev/link/hydration-mismatch)
- [Next.js suppressHydrationWarning](https://nextjs.org/docs/messages/react-hydration-error)

---

#### 6-4. ドロップダウンメニュー開閉時の画面ズレ

**エラーコード**: なし
**発生タイミング**: PCでドロップダウンメニュー（テーマ切り替え、ユーザーメニュー）を開閉した時

**症状**
- ドロップダウンメニューを開くと画面全体が左にズレる
- メニューを閉じると画面が右にズレる
- スクロールバーが表示・非表示を繰り返す
- 特にスクロール可能なページで顕著に発生

**原因**
1. **Radix UIのデフォルト動作**: `DropdownMenu`コンポーネントは、デフォルトで`modal={true}`が設定されている
2. **bodyのoverflow制御**: メニューが開くと自動的に`body`要素に`overflow: hidden`が適用される
3. **スクロールバーの消失**: `overflow: hidden`によりスクロールバーが消え、その幅（通常15-17px）分だけ画面が左にズレる
4. **ズレの往復**: メニューを閉じるとスクロールバーが戻り、画面が右にズレる

**技術的背景**
- Radix UIの`DropdownMenu`は、モーダルのような動作をデフォルトとしている
- モーダル動作では、背景のスクロールを防ぐために`body`の`overflow`を制御する
- しかし、ドロップダウンメニューのような小さなUIでは、この動作が不要な場合が多い
- スクロールバーの幅はブラウザやOSによって異なるため、ズレの大きさも環境によって変わる

**解決手順**

**DropdownMenuに`modal={false}`を追加:**

```tsx
// src/components/dashboard-header.tsx
<DropdownMenu modal={false}>  {/* ← modal={false}を追加 */}
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
      <Avatar>
        {/* ... */}
      </Avatar>
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent className="w-32 z-[70]" align="end" forceMount>
    {logoutButton}
  </DropdownMenuContent>
</DropdownMenu>
```

```tsx
// src/components/theme-switcher.tsx
<DropdownMenu modal={false}>  {/* ← modal={false}を追加 */}
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon" className="h-9 w-9">
      {/* テーマアイコン */}
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="min-w-[140px] z-[70]">
    {/* メニュー項目 */}
  </DropdownMenuContent>
</DropdownMenu>
```

**確認方法**
- ✅ ドロップダウンメニューを開いても画面がズレない
- ✅ スクロールバーが維持される
- ✅ メニューを閉じても画面がズレない
- ✅ 背景のスクロールが可能（必要に応じて）

**`modal={false}`の効果**
- `body`要素への`overflow: hidden`の適用を防ぐ
- スクロールバーが維持される
- メニュー開閉時の画面ズレが発生しない
- 背景のスクロールが引き続き可能

**他のDropdownMenuコンポーネントにも適用を検討**
この問題は、すべての`DropdownMenu`コンポーネントで発生する可能性があります：
- ユーザーメニュー
- テーマ切り替え
- フィルター選択
- その他のドロップダウンUI

各コンポーネントで`modal={false}`の追加を検討してください。

**予防策**
- 💡 新しく`DropdownMenu`を追加する際は、`modal={false}`の設定を検討
- 💡 モーダルのような動作が必要な場合のみ`modal={true}`（デフォルト）を使用
- 💡 小さなドロップダウンメニューには通常`modal={false}`が適切

**関連ファイル**
- `src/components/dashboard-header.tsx`
- `src/components/theme-switcher.tsx`
- `src/components/ui/dropdown-menu.tsx`

**参考リンク**
- [Radix UI DropdownMenu ドキュメント](https://www.radix-ui.com/primitives/docs/components/dropdown-menu)
- [Radix UI Modal prop 説明](https://www.radix-ui.com/primitives/docs/components/dropdown-menu#modal)

---

#### 6-5. ポート競合エラー

**エラーコード**: なし
**発生タイミング**: `npm run dev` 実行時

**症状**
- ポート3000が使用中というメッセージが表示される
- 自動的に別のポート（3001等）が使用される

**エラーメッセージ**
```
Port 3000 is in use by process 35907,
using available port 3001 instead.
```

**原因**
- ポート3000が既に別のプロセスで使用されている
- 前回の`npm run dev`が正しく終了せず、プロセスが残っている
- 別のアプリケーションがポート3000を使用している

**解決手順**

**方法A: プロセスを停止（推奨）**
```bash
# プロセスIDを確認
lsof -i :3000

# 出力例:
# COMMAND   PID         USER   FD   TYPE  DEVICE SIZE/OFF NODE NAME
# node    35907 katodaisuke   23u  IPv6  0x...      0t0  TCP *:hbci (LISTEN)

# プロセスを停止
kill 35907

# または強制停止
kill -9 35907

# 確認
lsof -i :3000  # 何も表示されなければOK

# 再起動
npm run dev
```

**方法B: ポート3001を使用**

`.env.local`を更新:
```bash
NEXTAUTH_URL="http://localhost:3001"
```

Google OAuth設定も更新が必要:
```
承認済みのリダイレクト URI:
http://localhost:3001/api/auth/callback/google
```

**方法C: すべてのNodeプロセスを停止**
```bash
# next devプロセスのみ停止
pkill -f "next dev"

# または、すべてのNodeプロセスを停止（注意）
pkill node
```

**確認方法**
- ✅ `lsof -i :3000`で何も表示されない
- ✅ `npm run dev`でポート3000が使用される

**予防策**
- ⚠️ 開発サーバー終了時は必ず Ctrl+C で正しく終了
- 💡 ターミナルを閉じる前にプロセスを停止
- 💡 VSCodeを終了する前に開発サーバーを停止

**関連ファイル**
- `.env.local`（ポート3001を使う場合）
- Google Cloud Console（OAuth設定）

---

#### 6-2. 本番環境でのキーワード検索のタイムラグ

**エラーコード**: なし
**発生タイミング**: 本番環境でダッシュボードのキーワード検索使用時

**症状**
- ローカル環境では検索が高速だが、本番環境ではタイムラグがある
- 入力途中で検索結果の取得に遅延が発生
- 記事が1件でもタイムラグが発生する

**原因**
- 検索のたびに`router.push()`でページ全体を再取得していた
- サーバーサイドで毎回全データを取得していた
- debounce (300ms) でもリクエスト数が多かった
- Vercel Serverless Functionの実行コストとネットワーク遅延

**解決手順**

**クライアントサイド検索への移行**
```typescript
// src/contexts/search-context.tsx（新規作成）
import { createContext, useContext, useState } from "react"

const SearchContext = createContext<{
  searchQuery: string
  setSearchQuery: (query: string) => void
}>()

export function SearchProvider({ children }) {
  const [searchQuery, setSearchQuery] = useState("")
  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      {children}
    </SearchContext.Provider>
  )
}
```

**検索バーの修正**
```typescript
// src/components/dashboard-search-bar.tsx
import { useSearch } from "@/contexts/search-context"

export function DashboardSearchBar() {
  const { searchQuery, setSearchQuery } = useSearch()

  const handleChange = (e) => {
    setSearchQuery(e.target.value) // router.push削除、即座に反映
  }
  // debounce削除、useDebouncedCallback削除
}
```

**フィルタリングの最適化**
```typescript
// src/components/dashboard-client.tsx
import { useMemo } from "react"
import { useSearch } from "@/contexts/search-context"

export function DashboardClient({ initialArticles }) {
  const { searchQuery } = useSearch()

  // useMemoで検索を最適化
  const filteredArticles = useMemo(() => {
    return initialArticles.filter((article) => {
      const matchesSearch =
        searchQuery === "" ||
        article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.siteName?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [initialArticles, searchQuery])
}
```

**確認方法**
- ✅ 検索入力と同時に結果が表示される
- ✅ ネットワークタブでリクエストが発生しない
- ✅ 本番環境でもローカル環境と同じ速度

**パフォーマンス改善**
- ✅ ネットワークリクエストゼロ（サーバー問い合わせなし）
- ✅ 入力と同時に検索結果が表示
- ✅ Vercel Serverless Function実行コストゼロ
- ✅ 検索対象にsiteNameを追加

**予防策**
- 💡 データ量が少ない場合（〜1000件）はクライアントサイド検索を使用
- 💡 データ量が多い場合はサーバーサイド検索を検討
- 💡 `useMemo`で不要な再計算を防止

**関連ファイル**
- `src/contexts/search-context.tsx`
- `src/components/dashboard-search-bar.tsx`
- `src/components/dashboard-client.tsx`
- `src/app/dashboard/page.tsx`

---

#### 6-3. モーダル内のセレクトボックスが開かない

**エラーコード**: なし
**発生タイミング**: 新規登録モーダルでステータス選択時

**症状**
- 新規登録モーダルのステータスセレクトボックスをクリックしても開かない
- 編集ページのセレクトボックスは正常に動作する
- クリックイベントは発火するが、ドロップダウンが表示されない

**原因**
- DialogとSelectのz-index階層の問題
  - DialogOverlay: `z-[80]`
  - DialogContent: `z-[90]`
  - SelectContent: `z-50`（デフォルト）
- SelectContentがDialogContentより低いz-indexでレンダリングされた
- Dialogの背後に隠れてクリックできない状態

**解決手順**

**SelectContentのz-indexを修正**
```typescript
// src/components/ui/select.tsx
const SelectContent = React.forwardRef<...>((...) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      className={cn(
        "relative z-[100] max-h-[--radix-select-content-available-height] ...",
        // z-50 から z-[100] に変更
      )}
    >
      {children}
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
```

**モーダル内のSelectを最適化**
```typescript
// src/components/article-create-modal.tsx
<Select value={status} onValueChange={(value) => setStatus(value as Status)}>
  <SelectTrigger id="status">
    <SelectValue />
  </SelectTrigger>
  <SelectContent position="popper" sideOffset={4}>
    <SelectItem value="TO_READ">読みたい</SelectItem>
    <SelectItem value="READING">読んでる</SelectItem>
    <SelectItem value="COMPLETED">読んだ</SelectItem>
  </SelectContent>
</Select>
```

**z-index階層（修正後）**
```
SelectContent:    z-[100] ← 最前面
DialogContent:    z-[90]
DialogOverlay:    z-[80]
```

**確認方法**
- ✅ 新規登録モーダルでセレクトボックスが開く
- ✅ 選択肢が正しく表示される
- ✅ 編集ページも引き続き正常に動作

**影響範囲**
- ✅ すべてのDialog内のSelectコンポーネントが正常に動作
- ✅ 他のモーダルでも同様の問題が解決

**予防策**
- 💡 Dialog内でSelectを使う場合はz-indexに注意
- 💡 `position="popper"`を使用してトリガーに対して相対配置
- 💡 shadcn/uiコンポーネントのz-index階層を把握

**関連ファイル**
- `src/components/ui/select.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/article-create-modal.tsx`

---

## 💡 FAQ

### Q1: middlewareが動作しているか確認する方法は？

**A:** 以下の方法で確認できます:

1. **console.logを追加**
```typescript
export function middleware(request: NextRequest) {
  console.log('🔥 Middleware executed:', request.nextUrl.pathname)
  // ...
}
```

2. **ターミナルでログを確認**
```bash
npm run dev
# ブラウザでアクセス
# ターミナルに "🔥 Middleware executed: /" と表示されればOK
```

3. **Basic認証ダイアログが表示されるか確認**
- 環境変数が設定されている場合、ブラウザで認証ダイアログが表示される

---

### Q2: ローカル環境ではBasic認証を無効にしたい

**A:** `.env.local`からBASIC_AUTH関連の環境変数を削除またはコメントアウトします:

```bash
# .env.local

# Basic認証を無効化
# BASIC_AUTH_USER="tech-clip"
# BASIC_AUTH_PASSWORD="パスワード"
```

middlewareは環境変数が設定されていない場合、Basic認証をスキップします:

```typescript
if (basicUser && basicPassword) {
  // Basic認証チェック
}
// 環境変数がなければここはスキップされる
return NextResponse.next()
```

---

### Q3: 本番環境でのみBasic認証を有効にしたい

**A:** Vercelの環境変数設定を使用します:

1. Vercelダッシュボード → Project → Settings → Environment Variables
2. 以下を追加:
   - `BASIC_AUTH_USER`: `your-username`
   - `BASIC_AUTH_PASSWORD`: `your-password`
   - Environment: **Production** のみ選択
3. 保存後、再デプロイ

これにより、本番環境でのみBasic認証が有効になります。

---

### Q4: Basic認証のユーザー名/パスワードを変更したい

**A:** `.env.local`を編集して、開発サーバーを再起動します:

```bash
# .env.local
BASIC_AUTH_USER="new-username"
BASIC_AUTH_PASSWORD="new-password"
```

```bash
# 開発サーバーを再起動
npm run dev
```

本番環境の場合は、Vercelの環境変数を更新して再デプロイします。

---

### Q5: middlewareのmatcherを変更したい

**A:** `middleware.ts`の`config.matcher`を編集します:

```typescript
export const config = {
  matcher: [
    // 特定のパスのみ
    '/dashboard/:path*',

    // または、除外パターン
    '/((?!api|_next/static|_next/image|favicon.ico).*)',

    // 複数指定
    ['/dashboard/:path*', '/admin/:path*'],
  ],
}
```

**よく使うパターン:**
- `/dashboard/:path*` - /dashboard配下すべて
- `/((?!api).*)` - /api以外すべて
- `/` - ルートのみ

変更後は開発サーバーを再起動してください。

---

### Q6: NextAuth.jsとBasic認証の両方が必要な理由は？

**A:** それぞれ異なる目的で使用されます:

| 認証方式 | 目的 | 適用範囲 |
|---------|------|---------|
| Basic認証 | 開発環境全体の保護<br>（検索エンジンからの保護） | サイト全体 |
| NextAuth.js | ユーザーごとの認証・認可<br>（ログイン機能） | ダッシュボード等 |

**フロー:**
```
1. Basic認証（開発環境の入り口）
   ↓
2. NextAuth.js（ユーザーログイン）
   ↓
3. ダッシュボードアクセス
```

本番環境では、Basic認証を無効にしてNextAuth.jsのみを使用することも可能です。

---

### Q7: `prisma db push`と`prisma migrate`の違いは？

**A:** 用途が異なります:

| コマンド | 用途 | マイグレーション履歴 | ロールバック |
|---------|------|---------------------|-------------|
| `prisma db push` | プロトタイピング<br>開発初期 | ❌ 作成されない | ❌ 不可 |
| `prisma migrate` | 本番運用<br>チーム開発 | ✅ 作成される | ✅ 可能 |

**推奨の使い分け:**
- **開発初期・個人開発**: `prisma db push`
- **本番運用・チーム開発**: `prisma migrate`

**TechClipプロジェクトの場合:**
- 開発・本番ともに`prisma db push`を使用（シンプル）
- プロバイダー不一致の問題を回避

---

### Q8: Docker PostgreSQLのデータが消えた場合は？

**A:** Dockerボリュームを確認し、必要に応じて再作成します:

```bash
# Dockerボリュームを確認
docker volume ls

# tech_clip_postgres-data が存在するか確認
docker volume inspect tech_clip_postgres-data

# 存在しない場合は再作成
docker-compose down
docker-compose up -d

# マイグレーション実行
npx prisma db push
```

**データのバックアップ（推奨）:**
```bash
# ダンプを作成
docker exec -t tech_clip-postgres-1 pg_dump -U postgres techclip > backup.sql

# リストア
docker exec -i tech_clip-postgres-1 psql -U postgres techclip < backup.sql
```

---

### Q9: ログイン時に「Can't reach database server」エラーが出る

**A:** Docker PostgreSQLが起動していない可能性があります。

**症状:**
- ローカル環境でログイン試行時にエラー
- `Can't reach database server at localhost:5432`

**解決手順:**

1. **Dockerが起動しているか確認**:
```bash
docker ps
```

エラーが出る場合:
```bash
# Docker Desktopを起動（macOS）
open -a Docker
```

2. **PostgreSQLコンテナを起動**:
```bash
docker-compose up -d
```

3. **起動を確認**:
```bash
docker-compose ps
```

4. **開発サーバーを再起動**:
```bash
npm run dev
```

**自動起動の設定（推奨）:**

`package.json`に以下を追加:
```json
{
  "scripts": {
    "predev": "docker-compose up -d",
    "dev": "next dev"
  }
}
```

これで`npm run dev`を実行すると自動的にDockerコンテナが起動します。

詳細: [1-4. Docker PostgreSQL未起動エラー](#1-4-docker-postgresql未起動エラー)

---

### Q10: 本番環境で検索が遅い場合は？

**A:** クライアントサイド検索に移行することで高速化できます。

**症状:**
- 本番環境でキーワード検索にタイムラグがある
- ローカルは速いが、本番が遅い

**原因:**
- 検索のたびにサーバーへリクエストが発生
- ネットワーク遅延とServerless Function実行時間

**解決策:**

データ量が少ない場合（〜1000件）はクライアントサイド検索を使用:

1. **SearchContextを作成** (`src/contexts/search-context.tsx`)
2. **検索バーを修正**: `router.push()`と`useDebouncedCallback`を削除
3. **`useMemo`でフィルタリングを最適化**

**メリット:**
- ✅ ネットワークリクエストゼロ
- ✅ 入力と同時に結果表示
- ✅ Vercel実行コストゼロ

詳細: [6-2. 本番環境でのキーワード検索のタイムラグ](#6-2-本番環境でのキーワード検索のタイムラグ)

---

### Q11: モーダル内のセレクトボックスが開かない場合は？

**A:** z-indexの問題です。SelectContentのz-indexを修正してください。

**症状:**
- Dialog（モーダル）内のSelectをクリックしても開かない
- 通常のページでは正常に動作

**原因:**
- SelectContentのz-index (`z-50`) がDialogContent (`z-90`) より低い

**解決策:**

`src/components/ui/select.tsx`を修正:
```typescript
const SelectContent = React.forwardRef<...>((...) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      className={cn(
        "relative z-[100] ...", // z-50 から z-[100] に変更
      )}
    >
```

**z-index階層:**
```
SelectContent:    z-[100] ← 最前面
DialogContent:    z-[90]
DialogOverlay:    z-[80]
```

詳細: [6-3. モーダル内のセレクトボックスが開かない](#6-3-モーダル内のセレクトボックスが開かない)

---

## 📝 参考コマンド集

### 環境変数の確認
```bash
# システム環境変数を確認
echo $BASIC_AUTH_USER
echo $BASIC_AUTH_PASSWORD

# .env.localの内容を確認
cat .env.local

# 環境変数が定義されている場所を検索
grep -r "BASIC_AUTH" ~/.zshrc ~/.bashrc ~/.bash_profile
```

### middlewareの確認
```bash
# middlewareの場所を確認
ls -la middleware.ts
ls -la src/middleware.ts

# プロジェクト構造を確認
tree -L 2 src/

# または
find . -name "middleware.ts" -type f
```

### データベース操作
```bash
# Prismaスキーマを適用（マイグレーション履歴なし）
npx prisma db push

# Prisma Client生成
npx prisma generate

# Prisma Studioを起動（GUI）
npx prisma studio

# マイグレーション実行
npx prisma migrate dev --name migration_name
npx prisma migrate deploy
```

### Docker操作
```bash
# Dockerデーモンの状態を確認
docker ps

# Docker Desktopを起動（macOS）
open -a Docker

# コンテナを起動
docker-compose up -d

# コンテナの状態を確認
docker-compose ps

# コンテナを停止
docker-compose down

# ログを確認
docker-compose logs postgres

# リアルタイムでログを監視
docker-compose logs -f postgres

# PostgreSQLに接続
docker exec -it tech_clip-postgres-1 psql -U postgres -d techclip
# または
docker exec -it techclip-postgres psql -U postgres -d techclip

# コンテナを再起動
docker-compose restart

# データベースをリセット
docker-compose down -v  # ボリュームも削除
docker-compose up -d

# ポート5432の使用状況を確認
lsof -i :5432
```

### 開発サーバー
```bash
# 開発サーバーを起動
npm run dev

# 特定のポートで起動
npm run dev -- -p 3001

# 環境変数を一時的に上書き
BASIC_AUTH_USER="test" npm run dev

# ポート使用状況を確認
lsof -i :3000

# プロセスを停止
kill $(lsof -t -i :3000)
```

### Git操作
```bash
# 変更を確認
git status
git diff

# middlewareの変更のみステージング
git add src/middleware.ts

# コミット
git commit -m "fix(middleware): Basic認証を修正"

# プッシュ
git push

# 直前のコミットを確認
git log -1 --stat
```

### Vercel
```bash
# Vercel CLIをインストール
npm i -g vercel

# ログイン
vercel login

# ローカルでVercelビルドをテスト
vercel build

# デプロイ
vercel --prod

# 環境変数を確認
vercel env ls

# ログを確認
vercel logs
```

---

## ✅ チェックリスト

### セットアップ時
- [ ] プロジェクト構造を確認（`src/`ディレクトリの有無）
- [ ] middlewareを正しい場所に配置（`src/middleware.ts` or `middleware.ts`）
- [ ] `.env.local`を作成し、環境変数を設定
- [ ] `.gitignore`に`.env.local`が含まれているか確認
- [ ] システム環境変数に競合する設定がないか確認（`echo $BASIC_AUTH_USER`）
- [ ] Docker PostgreSQLを起動（`docker-compose up -d`）
- [ ] Prismaスキーマを適用（`npx prisma db push`）

### データベース接続時
- [ ] Docker Desktopが起動しているか確認（`docker ps`）
- [ ] PostgreSQLコンテナが起動しているか確認（`docker-compose ps`）
- [ ] ポート5432が使用されているか確認（`lsof -i :5432`）
- [ ] DATABASE_URLが正しいか確認
- [ ] パスワードに特殊文字が含まれていないか確認
- [ ] ローカルで接続テスト（`npx prisma db push`）
- [ ] Supabaseでパスワードが正しいか確認（本番環境）
- [ ] テーブルが作成されているか確認（Prisma Studio）

### Basic認証が動作しない場合
- [ ] middlewareの場所が正しいか（`src/middleware.ts`）
- [ ] `.env.local`に`BASIC_AUTH_USER`と`BASIC_AUTH_PASSWORD`が設定されているか
- [ ] システム環境変数に古い値が残っていないか
- [ ] VSCode/ターミナルを再起動したか
- [ ] 開発サーバーを再起動したか
- [ ] ブラウザのキャッシュをクリアしたか

### Prismaマイグレーション時
- [ ] providerが開発・本番環境で統一されているか
- [ ] `migration_lock.toml`のproviderが正しいか
- [ ] `schema.dev.prisma`と`schema.prod.prisma`を削除したか（Docker使用時）
- [ ] package.jsonのスクリプトが最新か確認

### Vercelデプロイ時
- [ ] middlewareから`auth()`のimportを削除したか
- [ ] middlewareのサイズが1MB以下か
- [ ] dashboard/layout.tsxでNextAuth.jsの認証チェックを実装したか
- [ ] Vercelの環境変数を設定したか（DATABASE_URL、BASIC_AUTH等）
- [ ] ビルドログでエラーがないか確認
- [ ] デプロイ後、Basic認証とNextAuth認証が両方動作するか確認

### デバッグ時
- [ ] console.logを追加してmiddlewareが実行されるか確認
- [ ] ターミナルでログを確認
- [ ] ブラウザの開発者ツールでネットワークタブを確認
- [ ] Basic認証のレスポンスヘッダー（WWW-Authenticate）を確認
- [ ] Vercelのログを確認（`vercel logs`）

---

## 🔗 関連リソース

### 公式ドキュメント
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [NextAuth.js v5 (beta)](https://authjs.dev/getting-started/migrating-to-v5)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Vercel Edge Functions](https://vercel.com/docs/functions/edge-functions)
- [Supabase Database](https://supabase.com/docs/guides/database)

### トラブルシューティング
- [Edge Function Size Limits](https://vercel.link/edge-function-size)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Prisma Connection Troubleshooting](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)

---

## 📌 まとめ

このガイドでは、TechClipプロジェクトのセットアップ中に発生した主要なエラーと解決策をまとめました。

### 重要なポイント
1. ✅ **Docker起動**: 開発開始時に必ずDocker DesktopとPostgreSQLコンテナを起動
2. ✅ **middlewareの配置場所**: `src/`ディレクトリを使用する場合は`src/middleware.ts`
3. ✅ **環境変数の優先順位**: システム環境変数 > `.env.local`
4. ✅ **Edge Functionのサイズ制限**: middlewareではNextAuth.jsをimportしない
5. ✅ **認証の分離**: middlewareでBasic認証、layout.tsxでNextAuth.js認証
6. ✅ **データベースパスワード**: 特殊文字を避け、英数字のみを使用
7. ✅ **Prismaマイグレーション**: 開発・本番環境でプロバイダーを統一
8. ✅ **schema.prismaの管理**: 1つのファイルで統一（Git管理）

### ベストプラクティス
- 🎯 開発開始時のチェック: Docker起動 → PostgreSQL起動 → 開発サーバー起動
- 🎯 middlewareは軽量に保つ
- 🎯 環境変数はプロジェクトごとに`.env.local`で管理
- 🎯 システム環境変数にプロジェクト固有の設定を含めない
- 🎯 変更後は必ず再起動して動作確認
- 🎯 Docker PostgreSQLを開発環境でも使用
- 🎯 `prisma db push`でシンプルに管理
- 🎯 ローカルでテスト→Vercelデプロイの順を守る
- 🎯 `package.json`にpredevスクリプトを追加してDocker自動起動

問題が解決しない場合は、このガイドのチェックリストを順番に確認してください。

---

**最終更新**: 2025-10-30
**対象バージョン**: Next.js 15.5.6, NextAuth.js 5.0.0-beta.29, Prisma 6.17.1
