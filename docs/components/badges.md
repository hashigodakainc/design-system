# Badges

バッジは、短いラベルで状態、分類、段階を補助するコンポーネントである。本文の代わりに
重要情報を押し込まず、単体で意味が伝わる短い語を使う。

## バリエーション

- Neutral：未確定、未設定など、強い強調を必要としない情報。
- Primary：Primary系の強調。
- Secondary：Secondary系の強調。
- Violet：Violet系の強調。
- Orange：Orange系の強調。

色付きバッジはすべて白文字を使う。ただしブランド原色へ白文字を直接載せるとコントラストが
不足するため、Primary、Secondary、Orangeはバッジ専用の濃いトーンを使う。Neutralだけは
Surface背景とInk文字を使う。

| Variant | Background | Foreground | Contrast |
|---|---:|---:|---:|
| Neutral | `#ECE8F0` | `#18151D` | 14.92:1 |
| Primary | `#0070B8` | `#FAF9FC` | 4.99:1 |
| Secondary | `#5F7800` | `#FAF9FC` | 4.80:1 |
| Violet | `#6C4ED9` | `#FAF9FC` | 5.37:1 |
| Orange | `#B83A12` | `#FAF9FC` | 5.48:1 |

## 運用ルール

- Success、Warning、Error、Infoの意味はSemantic Colorsの策定後に割り当てる。
- 現段階の色名は見た目のバリエーションであり、状態の意味を固定しない。
- 色だけに依存せず、「利用可」「未策定」など明確なテキストを必ず表示する。
- 黒枠を色付きバッジへ付けない。Neutralだけは背景との境界をNeutral Borderで示す。
- 実装は`styles/components.css`の`.hsg-badge`と色別の修飾クラスを使う。
