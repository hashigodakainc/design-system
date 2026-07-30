# Hashigodaka Design System

Hashigodakaのデザイン原則、デザイントークン、ブランド資産、コンポーネント、
AI向け配布物の正本です。人が参照する入口として、閲覧型の
[ガイドラインサイト](guidelines/)も管理します。

人間が判断に使えるデザインガイドと、AIエージェントが成果物の生成・検証に使える
機械可読な定義を、同じ根拠から提供します。

## 現在のフェーズ

ブランドカラー、選定書体（Sora × LINE Seed JP）、固有モチーフを確定済みの基盤として、ガイドラインサイトと再利用可能なデザイントークン・資産の構築を進めています。
現在の利用可否と未決事項は、各正本JSON（`tokens/*.json`・`assets/manifest.json`）の
`status` / `pending` フィールドと、[ガイドラインサイトの策定状況](guidelines/)を
参照してください。

## 情報の配置

- 値（色・寸法・書体・資産メタデータ）と成熟度の正本は `tokens/*.json` と
  `assets/manifest.json` だけに置きます。
- [`docs/guidelines.md`](docs/guidelines.md) には横断的な判断だけを書き、値を再掲しません。
- `styles/tokens.css`・`styles/typography.css` は生成物です。ガイドラインサイトは正本JSONを直接読み込んで描画します。

## 構成

- [`tokens/`](tokens/) — 値・成熟度・未決事項の機械可読な正本
- [`assets/`](assets/) — 再利用可能なブランド資産（モチーフ・フォント）と機械可読な索引
- [`docs/guidelines.md`](docs/guidelines.md) — 横断的なデザイン判断の正本
- [`styles/`](styles/) — 正本から生成したCSS変数と採用済みコンポーネントCSS
- [`guidelines/`](guidelines/) — 人が閲覧するガイドラインサイト（トークン表示はJSONから生成）
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

1. 値・成熟度の変更は `tokens/*.json`・`assets/manifest.json` を編集する
2. `node scripts/build-tokens.mjs` で生成物を再生成する
3. 横断的な判断が変わった場合のみ `docs/guidelines.md` を更新する
4. `node scripts/validate-tokens.mjs` で検証する（CIでも自動実行）
5. `main` へコミットしてpushする

情報配置と更新ワークフローの合意の正本は
[Issue #1](https://github.com/hashigodakainc/design-system/issues/1) を参照してください。
