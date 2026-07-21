# Colors

## 現在の位置づけ

D-E-Dを、実際の制作物へ適用して検証する主案とする。色は利用可能な暫定トークンとして提供するが、
ブランドカラーの最終確定はB2B LPと図解での適用確認後に行う。

## パレット

| 役割 | トークン | 値 | 主な用途 |
|---|---|---:|---|
| Primary | `color.brand.primary` | `#00A0FF` | 主役となるグラフィック、ブランド表現 |
| Secondary | `color.brand.secondary` | `#C7F14A` | Primaryと対比する限定的なブランド表現 |
| Extended violet | `color.brand.extended.violet` | `#6C4ED9` | 図解、チャート、抽象モチーフ |
| Extended orange | `color.brand.extended.orange` | `#FF6B3D` | 図解、チャート、抽象モチーフ |
| Canvas | `color.neutral.canvas` | `#FAF9FC` | ページ背景 |
| Ink | `color.neutral.ink` | `#18151D` | 見出し、本文、色面上の文字 |
| Surface | `color.neutral.surface` | `#ECE8F0` | カード、図表、区切り面 |

## 面積配分

- Canvasを画面の基盤とし、最も広い面積を取る。
- Inkは文字と必要な罫線へ使い、黒い大面積を既定にしない。
- Primaryは一つの強いグラフィックなど、意味のあるブランド表現へ絞る。
- SecondaryとExtended ColorsはPrimaryより小さい面積で使う。
- 4つの有彩色を一つの画面で均等に使わない。図解で系列識別が必要な場合を例外とする。
- ブランドカラーの面を黒枠で囲むことを共通スタイルにしない。色同士はCanvas相当の余白で分け、
  カードやスウォッチなど情報構造の境界にはNeutral Borderを使う。
- Inkの強い輪郭は、Primaryボタン、キーボードフォーカス、文字やコード面など、意味のある箇所へ限定する。

## 用途別トークン

制作物では、可能な限り値や原色名ではなく `color.background.canvas`、`color.text.primary`、
`color.action.primary.background` などの用途別トークンを参照する。将来パレットを調整しても、
利用側の意図を保ったまま差し替えられるためである。

ボタンのPrimary / Secondaryは行動の重要度を表し、ブランドのPrimary / Secondary Colorとは
別の概念である。採用済みボタンはニュートラルカラーで階層を作る。

色付きバッジでは白文字を共通にするため、ブランド原色を直接使わず、コントラストを満たす
バッジ専用の濃いトーンを使う。これらはブランドパレットの置き換えでも、SuccessやWarningなどの
Semantic Colorsでもない。用途は [Badges](../components/badges.md) を参照する。

## アクセシビリティ

- Ink / Canvas、Ink / Primary、Ink / Secondaryは通常テキストの基準を満たす。
- Primaryをリンク文字としてCanvas上へ直接置く用途は、現時点では承認していない。
- 色だけで状態や系列を伝えず、ラベル、形、線種などを併用する。
- Success、Warning、Error、Infoは未選定であり、ブランドのExtended Colorsで代用しない。

機械可読な正本は [`tokens/colors.json`](../../tokens/colors.json)、CSSからの利用は
[`styles/tokens.css`](../../styles/tokens.css) を参照する。
