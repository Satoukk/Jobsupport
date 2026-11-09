# JOBサポ

就職活動を、相棒のキャラクターと一緒に進めるサポートアプリです。
企業・選考状況、予定、日々のミッションをまとめて管理できます。

## できること

- 新規登録、ログイン、ログアウト（パスワードはbcrypt、ログインセッションは7日間）
- 企業の登録・編集・削除、企業名・業界・メモの検索、選考状況の絞り込み
- ホームで「気になる」「選考中」「内定」「終了」の実際の件数を表示
- ミッションの追加・達成・削除。1回の達成で25 EXP、100 EXPでレベルアップ
- 相棒の名前の変更。新規登録時に相棒と最初のミッションを自動作成
- 予定の登録・編集・削除、直近の予定をホームに表示
- パソコン・スマートフォンに対応した画面、読み込み・エラー・空の状態の表示
- ユーザーごとのデータ保存・アクセス制御。再ログイン後もデータを保持

メール配信サービスの設定なしで登録・利用できます。メール認証・パスワード再設定・予定の通知メールは現バージョンにはありません。

## すぐに起動（Docker）

Docker Engine / Docker Desktop と Compose が必要です。

```bash
docker compose up --build
```

http://localhost:8080 を開き「新規登録」から始めてください。サンプルアカウントや外部サービスのAPIキーは不要です。
フロントエンドとAPIを同じGoサーバーから配信します。
データは `jobsupport-data` ボリュームに保存され、コンテナを停止しても残ります。`docker compose down -v` はデータも削除するため注意してください。

## ローカル開発

Node.js 24、npm、Go 1.26.2、Cコンパイラ（SQLiteドライバ用）が必要です。
WindowsではCコンパイラの導入、またはDocker起動を利用してください。

ターミナル1：

```bash
cd backend
cp .env.example .env
go run ./cmd/server
```

ターミナル2：

```bash
cd frontend
npm ci
npm run dev
```

http://localhost:5173 を開きます。`/api` はViteからポート8080のAPIへ転送されます。
初回起動時にSQLiteファイルとテーブルを自動作成します。

### PostgreSQLを使う場合

空のデータベースを作成し、`backend/.env` の `DATABASE_URL` を設定してください。
設定するとSQLiteの代わりにPostgreSQLを使用します。

```dotenv
DATABASE_URL=host=localhost user=jobsupport password=your-password dbname=jobsupport port=5432 sslmode=disable TimeZone=Asia/Tokyo
```

リモート接続ではデータベース側の要件に合わせてTLSを有効にしてください。

### 設定

| 変数 | 初期値 / 用途 |
| --- | --- |
| `DATABASE_URL` | 未設定ならSQLite。設定すればPostgreSQL |
| `SQLITE_PATH` | `jobsupport.db`。実行ディレクトリからの相対パス |
| `PORT` | APIのポート。`8080` |
| `ALLOWED_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173`。CORS許可元をカンマ区切りで指定 |
| `STATIC_DIR` | ビルド済みフロントエンドのディレクトリ。Dockerでは `/app/web` |
| `VITE_API_URL` | 未設定なら `/api`。フロントとAPIを別ホストへ置く場合にビルド前に指定 |

公開環境ではHTTPS経由で配信し、データベースまたはSQLiteボリュームを定期的にバックアップしてください。
認証用トークンはブラウザーのsessionStorageに保持し、タブを閉じると再ログインが必要です。ログアウトするとサーバー側のセッションも失効します。
認証APIは1 IPあたり1分間に30回まで、JSONは64 KiBまで受け付けます。
レート制限はプロセス単位です。複数台で公開する場合はリバースプロキシ側でも制限してください。

## 検証

```bash
cd backend
go test ./...
go vet ./...

cd ../frontend
npm ci
npm run build
npm run lint
npx playwright install chromium
npm run test:e2e
```

ブラウザーテストはAPIとViteを自動起動します。すでに起動していれば再利用します（CIでは再利用しません）。
自動起動時のテスト用SQLiteは `frontend/.e2e.db` です。テストごとに独立したメールアドレスを使います。
ビルド済みアプリやDockerを検証する場合は `E2E_BASE_URL=http://localhost:8080 npm run test:e2e` を使います。
システムのChromiumを使う場合は `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/path/to/chromium` を指定できます。

APIテストは一時SQLite上で、認証、他ユーザーからの読み書き拒否、企業・予定のCRUD、空のメモへの更新、重複達成時の報酬防止、レベルアップ、ログアウト後の拒否を検証します。
PostgreSQLでも同じテストを実行する場合は、テスト専用のデータベースを用意し、`TEST_DATABASE_URL` に接続文字列を渡してください。
ブラウザーテストは登録、ログイン、各機能の操作、再読み込み、スマートフォン幅での横はみ出しを検証します。
GitHub Actionsでもビルド、Lint、APIテスト、ブラウザーテストを実行します。

## 構成

```text
frontend/           React 19 / TypeScript / Vite
  src/App.tsx       各画面・フォーム・ナビゲーション
  src/api.ts        API接続・認証トークン・エラー処理
  e2e/              Playwrightの操作テスト
backend/            Go / Gin / GORM
  cmd/server/       起動・CORS・静的ファイル配信
  internal/routes/  認証、企業、予定、ミッション、育成のAPIとテスト
  internal/model/   保存するデータの定義
  internal/database/ SQLite / PostgreSQL接続・マイグレーション
docs/               企画資料・API仕様・変更時の注意点
```

## 既存版からの変更

以前のAPIは認証なしでユーザーIDを受け付けていたため、認証済みユーザーをセッションから特定するAPIへ統一しました。
旧フロントエンドとのAPI互換性はありません。詳しくは [API仕様と移行の注意](docs/api.md) を参照してください。
既存DBは先にバックアップし、コピーで動作を確認してください。SQLiteとPostgreSQLの間の自動データ移行はありません。

## メンバー

- 佐藤輝三
