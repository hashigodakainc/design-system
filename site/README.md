# ガイドライン公開サイト

`guidelines/` の人間向けガイドラインを Cloudflare Workers Static Assets で公開するための、薄い配布アダプターです。公開先は `https://design.hashigodaka.co.jp/`、Worker名は `hashigodaka-design-guidelines` です。

同じオリジンの `https://design.hashigodaka.co.jp/mcp` は、より具体的なCloudflare Workers Routeで
別のMCP Workerへ振り分けます。このWorkerは、それ以外のガイドラインと公開資産を配信します。

## SSOTと公開範囲

値・成熟度の正本は引き続き `../tokens/*.json` と `../assets/manifest.json`、横断的な判断の正本は `../docs/guidelines.md` です。`dist/` は `pnpm build` が毎回作り直す未管理の配信成果物で、直接編集しません。

ビルドは `scripts/public-files.mjs` の許可リストだけをコピーします。`AGENTS.md`、Gitメタデータ、MCP実装、サイト用スクリプトなど、許可リスト外のファイルは公開しません。フォントの配布条件を同梱するため、利用するフォントのOFL文書も公開対象に含めます。

## ローカル検証

Node.js 22以上と pnpm 11を使用します。

```sh
pnpm install --frozen-lockfile
pnpm verify
```

`verify` は許可リストからのビルド、SSOTとの一致・参照切れ・公開漏れ・セキュリティヘッダーの検査、Wranglerのdry-runを実行します。

実際のHTTP応答は、別々のターミナルで次を実行して確認します。

```sh
pnpm dev
pnpm smoke
```

任意のデプロイ先も検査できます。

```sh
pnpm smoke -- https://design.hashigodaka.co.jp/
```

## Workers Builds

- Root directory: `site`
- Production branch: `main`
- Build command: `pnpm build`
- Deploy command: `pnpm exec wrangler deploy`
- Watch paths: `guidelines/*`, `assets/*`, `styles/*`, `tokens/*`, `docs/guidelines.md`, `site/*`

デプロイは Workers Builds のGitHub連携を正とし、GitHub Actionsに認証情報や別のデプロイ経路を持たせません。存在しないパスはSPAフォールバックせず404になります。`workers.dev` とプレビューURLは無効です。未ハッシュ資産のキャッシュには、Cloudflare Static Assets既定の再検証設定を使用します。
