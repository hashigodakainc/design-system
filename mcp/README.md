# Hashigodaka Design System MCP

Hashigodakaデザインシステムの正本を、AIエージェントから参照するためのMCPサーバーです。
5つのtoolをCloudflare Workers上のStreamable HTTPで提供します。

## データの読み込み

- Workerはリポジトリ直下の正本から `pnpm build:snapshot` が生成する
  `src/generated/design-snapshot.json` をbundleへ同梱します。
- フォントとSVGはガイドラインサイトと同じ公開資産を参照します。Workerの `get_asset` は
  資産メタデータへ `https://design.hashigodaka.co.jp/assets/...` の絶対URLを加え、SVGでは
  従来の本文も返します。

snapshotは正本から再生成するビルド成果物であり、gitでは管理しません。正本の更新をWorkerへ
反映するにはsnapshotの再生成と再デプロイが必要です。

`get_tokens` では、プリミティブ／セマンティックを `color`、コンポーネント固有の色と寸法を
`component` として分けて返します。角丸、境界線、フォーカス輪郭は `shape` として返します。
それぞれの正本は `tokens/components.json` と `tokens/shape.json` です。

## セットアップ

Node.js 22以上と、`package.json` の `packageManager` に記録したpnpmを使用します。

```sh
cd mcp
pnpm install
pnpm typecheck
pnpm test
pnpm build
```

## Cloudflare Worker

ローカルのworkerdでRemote MCPとstatic assetsを確認します。

```sh
pnpm dev
```

既定のMCP endpointは `http://127.0.0.1:8787/mcp`、health endpointは
`http://127.0.0.1:8787/mcp/health` です。Workerは既存client向けの
`initialize`（2025-era、stateless）と、`server/discover` による2026-eraの両方を受け付けます。

`wrangler.jsonc` にはWorker名 `hashigodaka-design-system-mcp`、ガイドラインサイトのCustom
Domainより優先されるRoute `design.hashigodaka.co.jp/mcp*` と `nodejs_compat` を定義しています。

デプロイにはCloudflare Workers BuildsのGitHub連携を使用します。Cloudflare Dashboardで
Worker `hashigodaka-design-system-mcp` とこのリポジトリを接続し、次のbuild設定を使用します。

- Production branch: `main`
- Root directory: `mcp`
- Build command: `pnpm typecheck && pnpm test`
- Deploy command: `pnpm exec wrangler deploy`
- Non-production branch builds: 無効
- Build watch paths: `assets/**`、`docs/**`、`mcp/**`、`styles/**`、`tokens/**`

`main` へ対象パスの変更がpushされると、Workers Buildsがsnapshotを再生成してWorkerを
デプロイします。Cloudflareがbuild用API tokenを管理するため、GitHub repositoryへ
Cloudflareのcredentialを保存しません。GitHub Actionsは正本とWorkerの検証だけを担当します。

公開endpointで5 toolとstatic assetを確認する手動検証は次のコマンドで実行できます。

```sh
pnpm smoke:remote
# 別endpointを検証する場合
MCP_BASE_URL=https://example.workers.dev pnpm smoke:remote
```

Cloudflare側では、ガイドラインWorkerのCustom Domain `design.hashigodaka.co.jp` を維持したまま、
MCP Workerへ `design.hashigodaka.co.jp/mcp*` のRouteを設定します。より具体的なRouteが優先される
ため、`/mcp` と `/mcp/health` だけがMCP Workerへ到達し、それ以外はガイドラインWorkerが
配信します。

デプロイ後はCloudflareの同名レート制限ルール `Hashigodaka MCP rate limits` も、POST
`/mcp` のホスト条件を `design.hashigodaka.co.jp` へ切り替えます。新endpointのsmoke成功後、
Worker Domainsに旧MCPホストが残っていないことも確認します。

## 提供するtool

- `get_presentation_profile` — 共同編集する資料用の仕様・資産・ガイド・検証状態をまとめて返す
- `get_tokens` — color / component / typography / layout / shape のトークン、解決前後のalias、status、pendingを返す
- `get_asset` — 資産メタデータと、SVG資産の場合はSVGソース本文を返す
- `read_guideline` — `docs/*.md` のMarkdown本文を返す
- `get_stylesheet` — `styles/*.css` のCSS本文を返す

`get_tokens`、`get_asset`、`get_presentation_profile` は `structuredContent` を返し、同一内容を直列化したJSONをtext
contentにも含めます。`read_guideline` と `get_stylesheet` はMarkdown本文とCSS本文をtext
contentだけで返します。

資産ID、ガイドラインID、スタイルシート名は正本から組み立て、tool descriptionと入力enumへ
反映します。正本更新後はsnapshotを再生成し、Workerを再デプロイしてください。

ワードマークを再調整する場合は、`assets/manifest.json` のwordmarkにある `generator` を編集し、
`pnpm build:wordmark` を実行します。SVGとmanifestの `viewBox` はコマンドが同時に更新します。

## 資料作成用プロファイル

`get_presentation_profile({"target":"google-slides"})` は `tokens/presentation.json` を読み、
書体、資料用の単位を持つサイズ、セマンティック／コンポーネント参照から解決した色、
ワードマーク・モチーフのSVGと利用条件、横断ガイドを一括で返します。
`source.status` と `source.pending` は必ず確認してください。初版は共同編集用の候補であり、
Googleスライドでの書体選択・PPTX取り込み・PDF出力の実機確認を残しています。
Google Fonts収録だけをSlidesの対応証明にしません。

呼び出し側は `structuredContent` をJSONに保存して生成スキルへ渡せます。
生成と目視確認は `hashigodakainc/hashigodaka-skills` の `hashigodaka-deck` が担当し、
MCPはファイル生成、保存、アップロードを行いません。`schemaVersion` が出力契約を識別します。
`references.colors` は元の参照、`profile.colors` は解決済み値です。

色は既存の正本を参照し、資料専用の値と検証状況だけを `tokens/presentation.json` で管理します。
Web用の文字サイズやCSSフォントの別名をそのままOfficeへ渡しません。
配布するPPTXにはフォントが自動で埋め込まれるわけではありません。

開発中に同じ出力契約をローカルで取得する場合:

```sh
pnpm build:snapshot
node --import tsx scripts/export-presentation.ts /tmp/profile.json
```

出力JSONは生成物なのでコミットしません。
