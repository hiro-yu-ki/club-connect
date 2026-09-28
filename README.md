> 公開用スナップショットです。実データ、認証情報、運用環境の識別子は含めていません。

# ClubConnect

月謝や長期契約なしで、地域の教室・クラブを1回単位で予約する検証用MVPです。日本語・モバイル優先のSSR Web/PWAとして動作し、実決済・換金は一切行いません。

## Architecture

- Node.js 24 + TypeScript（標準ライブラリのみ）のSSR/JSON API
- `ClubService` に入力検証・RBAC・台帳・予約トランザクションを集約
- 開発時は直列化されたJSON/Memory Store。PostgreSQL用schemaは `db/migrations/001_initial.sql`
- HttpOnly/SameSite署名session、CSRF token、CSP、HTML escape
- Payment/Email/private object storageはinterface経由。credentialなしではMock
- manifest/service worker/レスポンシブCSSによるPWA

ネットワークアクセス禁止の隔離環境で作成したため、React/ORM等の外部依存は追加していません。PostgreSQL migrationには並行制御向け制約・indexを含みます。実運用adapterへ切り替える際はDB transaction内でslot行を `SELECT ... FOR UPDATE` し、台帳残高も同一transactionで再検証してください。

## Local setup

Node.js 24以上だけが必要です。`.env.example` を参考にローカル環境変数を設定し、実値をcommitしないでください。

```powershell
npm.cmd run seed
npm.cmd start
```

`http://localhost:3000` を開きます。seed利用者は `user@example.test`、提供者は `provider@example.test`、passwordはいずれも `demo-password` です。seed管理者は安全のためログイン不能です。管理者作成は運用側の招待処理で行ってください。

## Tests and quality

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
npm.cmd run security
```

外部packageがないため、typecheckはNodeのTypeScript parserによる全ファイル構文/型消去互換チェック、securityはcredentialパターンと依存数を検査します。unit/integration/E2Eには年齢、手数料、キャンセル、状態遷移、認可、審査、webhook冪等性、同時予約、二重消費、売上、レビュー、HTTP/PWAを含みます。

## PostgreSQL migration / backup

検証DBをバックアップ後、接続先を十分確認して `psql "$env:DATABASE_URL" -f db/migrations/001_initial.sql` を適用します。rollbackはデータを破壊し得るため自動化していません。復元可能性を確認したbackupから新DBへrestoreし、migrationを再適用して切り替える手順を推奨します。JSON開発storeは停止中に `data/clubconnect.json` をコピーしてbackupできます。

## Staging

`Dockerfile` と `deploy/render.yaml` を用意しています。hostingアカウント側で `APP_BASE_URL` と各secretを登録し、health check `/api/health` を確認します。private storageの審査書類は公開bucketへ置かず、短時間の署名URLだけを管理者・提出者へ返してください。公開後はスマートフォン実機で登録→検索→コイン→予約→キャンセルをsmoke testします。

## Security and scope

1コイン＝1円相当はテスト上の表示のみです。実決済、現金化、銀行振込は実装していません。一般公開前に法務・未成年者向け表現・規約・privacyを専門家が確認する必要があります。ログへpassword、token、credential、不要な個人情報を出さないでください。
