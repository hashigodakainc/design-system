# Hashigodaka Design System MCP

Hashigodakaデザインシステムの正本を、AIエージェントから参照するためのMCPサーバーです。
同じ4つのtoolを、ローカル開発向けのstdioとCloudflare Workers向けのStreamable HTTPで
提供します。

## データの読み込み

- stdioは起動時にリポジトリ直下の `tokens/*.json`、`assets/manifest.json`、
  `assets/**`、`docs/*.md`、`styles/*.css` を直接読み込みます。
- Workerは `pnpm build:snapshot` が生成する
  `src/generated/design-snapshot.json` をbundleへ同梱します。
- フォントとSVGはWranglerのstatic assets bindingから配信します。Workerの `get_asset` は
  資産メタデータへ `https://mcp-design.hashigodaka.co.jp/assets/...` の絶対URLを加え、
  SVGでは従来の本文も返します。

snapshotは正本から再生成するビルド成果物であり、gitでは管理しません。正本の更新をWorkerへ
反映するにはsnapshotの再生成と再デプロイが必要です。

## セットアップ

Node.js 22以上と、`package.json` の `packageManager` に記録したpnpmを使用します。

```sh
cd mcp
pnpm install
pnpm typecheck
pnpm build
pnpm smoke
```

## stdio

ビルド後に次のコマンドで起動します。標準出力はMCP通信専用です。

```sh
pnpm start:stdio
```

Claude CodeまたはCodexへ登録する場合は、`/absolute/path/to/design-system` を実際の絶対パスへ
置き換えます。

```sh
claude mcp add hashigodaka-design-system -- node /absolute/path/to/design-system/mcp/dist/stdio.js
codex mcp add hashigodaka-design-system -- node /absolute/path/to/design-system/mcp/dist/stdio.js
```

## Cloudflare Worker

ローカルのworkerdでRemote MCPとstatic assetsを確認します。

```sh
pnpm dev
```

既定のMCP endpointは `http://127.0.0.1:8787/mcp`、health endpointは
`http://127.0.0.1:8787/health` です。Workerは既存client向けの
`initialize`（2025-era、stateless）と、`server/discover` による2026-eraの両方を受け付けます。

`wrangler.jsonc` にはWorker名 `hashigodaka-design-mcp`、Custom Domain
`mcp-design.hashigodaka.co.jp`、`nodejs_compat`、static assets bindingを定義しています。

`main` へMCPの正本または実装がpushされると、`Deploy design system MCP` workflowがsnapshotを
再生成してWorkerをデプロイし、公開endpointで4 toolとstatic assetをsmoke testします。手動検証は
次のコマンドで実行できます。

```sh
pnpm smoke:remote
# 別endpointを検証する場合
MCP_BASE_URL=https://example.workers.dev pnpm smoke:remote
```

workflowの初回実行前に、GitHub repositoryへ次を設定します。

- Variable `CLOUDFLARE_ACCOUNT_ID`: HashigodakaのCloudflare Account ID
- Secret `CLOUDFLARE_API_TOKEN`: Hashigodaka Accountに限定したWorkers Scripts Edit token

Cloudflare側では `mcp-design.hashigodaka.co.jp` のCustom Domainを有効にします。

## 提供するtool

- `get_tokens` — color / typography / layout のトークン、解決前後のalias、status、pendingを返す
- `get_asset` — 資産メタデータと、SVG資産の場合はSVGソース本文を返す
- `read_guideline` — `docs/*.md` のMarkdown本文を返す
- `get_stylesheet` — `styles/*.css` のCSS本文を返す

`get_tokens` と `get_asset` は `structuredContent` を返し、同一内容を直列化したJSONをtext
contentにも含めます。`read_guideline` と `get_stylesheet` はMarkdown本文とCSS本文をtext
contentだけで返します。

資産ID、ガイドラインID、スタイルシート名は正本から組み立て、tool descriptionと入力enumへ
反映します。stdioでは正本更新後にサーバーを再起動し、Workerではsnapshotを再生成してください。

ワードマークを再調整する場合は、`assets/manifest.json` のwordmarkにある `generator` を編集し、
`pnpm build:wordmark` を実行します。SVGとmanifestの `viewBox` はコマンドが同時に更新します。
