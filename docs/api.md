# API仕様と移行の注意

すべてJSONです。エラーは `{"error":"日本語の説明"}`、削除とログアウト成功は204です。
`POST /api/users` と `POST /api/users/login` は `{ user: { id, username, email }, token }` を返します。
以降は `Authorization: Bearer <token>` が必要です。トークンの有効期間は7日です。

| メソッド | パス | リクエスト / レスポンス |
| --- | --- | --- |
| GET | `/api/health` | 稼働確認 |
| POST | `/api/users` | `{username,email,password}`。相棒とミッションも同一トランザクションで生成 |
| POST | `/api/users/login` | `{email,password}` |
| GET | `/api/me` | `{user}` |
| POST | `/api/logout` | セッションを失効 |
| GET | `/api/companies` | `{companies:[]}`。任意の `q` で名前・業界・メモの部分一致検索 |
| POST | `/api/companies` | `{company_name,industry,memo,status}` → `{company}` |
| PUT | `/api/companies/:id` | 同上。空の業界・メモも保存可能 |
| DELETE | `/api/companies/:id` | 自分の企業を削除 |
| GET | `/api/characters` | `{character:{id,name,level,exp}}` |
| PUT | `/api/characters` | `{name}`。経験値・レベルは直接変更不可 |
| GET | `/api/tasks` | `{tasks:[]}` |
| POST | `/api/tasks` | `{title}` → `{task}` |
| POST | `/api/tasks/:id/complete` | 達成済みなら報酬なし。達成と育成の更新は同一トランザクション |
| DELETE | `/api/tasks/:id` | 自分のミッションを削除。獲得済み経験値はそのまま |
| GET | `/api/schedules` | `{schedules:[]}`。日時昇順 |
| POST | `/api/schedules` | `{title,schedule_at,memo}` → `{schedule}` |
| PUT | `/api/schedules/:id` | 同上 |
| DELETE | `/api/schedules/:id` | 自分の予定を削除 |

企業の `status` は `interested`（気になる）、`applying`（選考中）、`offer`（内定）、`closed`（終了）のいずれかです。
予定の `schedule_at` は `2026-12-01T09:00:00+09:00` のようなRFC3339形式で送信します。
画面は端末のタイムゾーンで表示します。過去の予定も編集・削除できます。

未認証は401、自分以外のデータや存在しないIDは404、入力不備は400、重複メールは409です。
ユーザーID、経験値、達成状態などの保護対象フィールドをJSONで追加しても操作できません。
パスワードは8文字以上、bcryptの制限に合わせ72バイト以下です。メールは小文字化・前後空白の除去後に一意性を検証します。
認証トークンは32ランダムバイトから生成し、DBにはSHA-256ダイジェストだけを保存します。

## 旧データベース

- 最初はデフォルトのSQLiteまたは新しいPostgreSQLデータベースで起動してください。
- 旧版の平文パスワードでのログインは受け付けません。既存ユーザーを移す場合は、バックアップしたDB上でパスワードをbcryptへ変換するか、別途パスワード再設定の導線を作る必要があります。
- メールの重複や大文字小文字違いがある場合は、小文字に正規化したうえで重複を解消してから一意インデックスを適用してください。
- 企業には `status` が加わりました。旧レコードの空の状態は移行時に `interested` などへ設定してください。
- 旧ユーザーに相棒が存在しない場合は移行時に作成が必要です。新規登録ユーザーには自動で作成します。
- 旧 `applications`、`group_tasks`、メール認証APIは使用しません。既存テーブルを自動削除する処理はありません。選考状況は企業、ミッションは新しい `tasks` テーブルで管理します。

この変更には既存データの自動移行は含みません。既存利用者がいる環境では移行作業と検証を先に行い、その後に切り替えてください。
