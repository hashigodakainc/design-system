# Hashigodaka Design System MCP

Hashigodakaデザインシステムの正本を、AIエージェントから参照するためのstdio MCPサーバーです。
MCP専用のデータは持たず、起動時にリポジトリ直下の `tokens/*.json`、
`assets/manifest.json`、`docs/*.md`、`styles/*.css` と資産ファイルを直接読み込みます。

## セットアップと起動

Node.js 20以上と pnpm 11.18.0を使用します。

```sh
cd mcp
pnpm install
pnpm build
pnpm start
```

`pnpm start` は `node dist/index.js` をstdioサーバーとして起動します。標準出力はMCPの
通信専用です。

実際のstdio接続と4つのtoolを確認するスモークテストは、ビルド後に実行します。

```sh
pnpm smoke
```

## 提供するtool

- `get_tokens` — color / typography / layout のトークン、解決前後のalias、status、pendingを返す
- `get_asset` — 資産メタデータと、SVG資産の場合はSVGソース本文を返す
- `read_guideline` — `docs/*.md` のMarkdown本文を返す
- `get_stylesheet` — `styles/*.css` のCSS本文を返す

`get_tokens` と `get_asset` は `structuredContent` を返し、後方互換のため同一内容を
直列化したJSONをtext contentにも含めます。`read_guideline` と `get_stylesheet` はそれぞれ
Markdown本文とCSS本文をtext contentだけで返します。

資産ID、ガイドラインID、スタイルシート名は起動時に正本を走査し、tool descriptionと入力enumへ
反映します。正本を更新した場合はサーバーを再起動してください。

ワードマークを再調整する場合は、`assets/manifest.json` の wordmark にある `generator` を編集し、
`pnpm build:wordmark` を実行してから変更をpushします。SVGとmanifestの`viewBox`はコマンドが
同時に更新します。

## Claude Codeへ登録

先に `pnpm build` を実行し、`/absolute/path/to/design-system` を実際の絶対パスへ
置き換えます。

```sh
claude mcp add hashigodaka-design-system -- node /absolute/path/to/design-system/mcp/dist/index.js
```

プロジェクト設定として共有する場合は `--scope project` を追加します。

## Codexへ登録

先に `pnpm build` を実行し、同様に絶対パスを指定します。

```sh
codex mcp add hashigodaka-design-system -- node /absolute/path/to/design-system/mcp/dist/index.js
```
