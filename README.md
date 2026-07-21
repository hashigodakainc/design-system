# Hashigodaka Design System

Hashigodakaのデザイン原則、デザイントークン、ブランド資産、コンポーネント、
AI向け配布物の正本です。人が参照する入口として、閲覧型の
[ガイドラインサイト](guidelines/)も管理します。

人間が判断に使えるデザインガイドと、AIエージェントが成果物の生成・検証に使える
機械可読な定義を、同じ根拠から提供します。

## 現在のフェーズ

D-E-Dをカラースキームの主案として、ガイドラインサイトと再利用可能なデザイントークンの構築を
開始しました。色と用途別タイポグラフィは暫定利用できますが、フォントファミリー、正式ロゴ、
Semantic Colors、レイアウト基礎、コンポーネントは未決定です。現在の利用可否は
[docs/status.md](docs/status.md) を参照してください。

## 構成

- [`tokens/`](tokens/) — AIやツールが参照する機械可読な正本
- [`styles/`](styles/) — 正本から生成したCSS変数と採用済みコンポーネントCSS
- [`guidelines/`](guidelines/) — 人が閲覧するガイドラインサイト
- [`docs/foundations/`](docs/foundations/) — 人間向けの基礎ガイド
- [`docs/components/`](docs/components/) — 採用済みコンポーネントの仕様
- [`examples/`](examples/) — 承認済みトークンの実装見本
- [`scripts/`](scripts/) — トークンの生成と機械検証
- [`process-archive/`](process-archive/) — 選定過程の比較HTMLと資産

## カラーを使う

```css
@import "path/to/design-system/styles/tokens.css";

.example {
  color: var(--hsg-color-text-primary);
  background: var(--hsg-color-background-canvas);
}
```

カラーとタイポグラフィのトークンを変更したら、次の2つを実行します。

```sh
node scripts/build-tokens.mjs
node scripts/validate-tokens.mjs
```

制作目的、判断理由、未決事項は [docs/design-brief.md](docs/design-brief.md)、色の用途は
[docs/foundations/colors.md](docs/foundations/colors.md)、文字の用途は
[docs/foundations/typography.md](docs/foundations/typography.md)、ボタンの仕様は
[docs/components/buttons.md](docs/components/buttons.md) を参照してください。
