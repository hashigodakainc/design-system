# Hashigodaka Design System

Hashigodakaのデザイン原則、デザイントークン、ブランド資産、コンポーネント、
AI向け配布物の正本です。人が参照する入口として、閲覧型の
[デザインシステムサイト](site/src/)も管理します。公開版は
[`design.hashigodaka.co.jp`](https://design.hashigodaka.co.jp/)で閲覧できます。
AIエージェント向けRemote MCPは、同じオリジンの
[`design.hashigodaka.co.jp/mcp`](https://design.hashigodaka.co.jp/mcp)で提供します。

人間が判断に使えるデザインガイドと、AIエージェントが成果物の生成・検証に使える
機械可読な定義を、同じ根拠から提供します。

## 現在のフェーズ

ブランドカラー、選定書体（Sora × LINE Seed JP）、固有モチーフを確定済みの基盤として、デザインシステムサイトと再利用可能なデザイントークン・資産の構築を進めています。
現在の利用可否と未決事項は、各正本JSON（`tokens/*.json`・`assets/manifest.json`）の
`status` / `pending` フィールドと、[デザインシステムサイトの策定状況](site/src/)を
参照してください。

## 情報の配置

- 値（色・寸法・書体・資産メタデータ）と成熟度の正本は `tokens/*.json` と
  `assets/manifest.json` だけに置きます。
- Webを含む全媒体に共通し、トークンや資産メタデータを補完する定性的な判断は
  [`docs/guidelines.md`](docs/guidelines.md) に書き、値を再掲しません。
- `styles/tokens.css`・`styles/typography.css` は生成物です。デザインシステムサイトは正本JSONを直接読み込んで描画します。

トークンは、値を表すPrimitive、用途を表すSemantic、部品固有のComponentで構成します。
色は `tokens/colors.json`、タイポグラフィは `tokens/typography.json`、レイアウトは
`tokens/layout.json`、形状は `tokens/shape.json`、コンポーネント固有値は
`tokens/components.json` を正本とし、値を複製せず外側の層から内側の層を参照します。
制作物は原則としてSemanticまたはComponentを使用し、余白プリミティブだけ直接参照を許可します。
参照規律と例外は正本JSONと `scripts/color-layer-rules.mjs` で機械検証します。

## 構成

- [`tokens/`](tokens/) — 値・成熟度・未決事項の機械可読な正本
- [`assets/`](assets/) — 再利用可能なブランド資産（モチーフ・フォント）と機械可読な索引
- [`docs/guidelines.md`](docs/guidelines.md) — 横断的なデザイン判断の正本
- [`styles/`](styles/) — 正本から生成したCSS変数と採用済みコンポーネントCSS
- [`site/`](site/) — 人が閲覧するデザインシステムサイトのソース、ビルド、検証、Cloudflare Workers Static Assets配信設定
- [`mcp/`](mcp/) — AIエージェントが正本を参照するRemote MCPサーバー
- [`scripts/`](scripts/) — トークンの生成と機械検証

## カラーを使う

```css
@import "path/to/design-system/styles/tokens.css";

.example {
  color: var(--hsg-color-text-primary);
  background: var(--hsg-color-background-canvas);
}
```

## 更新の手順

開発ツールは `mise install` で、CIと各パッケージが指定するNode・pnpmへ揃えられます。

1. 値・成熟度の変更は `tokens/*.json`・`assets/manifest.json` を編集する
2. `node scripts/build-tokens.mjs` で生成物を再生成する
3. トークンや資産メタデータを補完する定性的な判断が変わった場合のみ、`docs/guidelines.md` を更新する
4. `node scripts/validate-tokens.mjs` で検証する（CIでも自動実行）
5. `main` へコミットしてpushする

情報配置と更新ワークフローの合意の正本は
[Issue #1](https://github.com/hashigodakainc/design-system/issues/1) を参照してください。
