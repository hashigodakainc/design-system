# Hashigodaka 資料ガイドライン

スライド、提案書、図解、SNS投稿画像など、Webページ以外のビジネス成果物へブランドを適用する
ための横断的な判断である。ブランド表現の原則は `docs/guidelines.md`、値の正本は
`tokens/*.json`、資産の正本は `assets/manifest.json`、成熟度と未決事項は各JSONの
`status` / `pending` フィールドを参照する。

Web以外の媒体はCSS変数を参照できないため、制作時に必要な色・寸法の直値は、MCPの
`get_tokens` が返すトークン名ごとの解決済み値から取得する。値を資料テンプレートやこの文書へ
転記して正本にしない。資産は `get_asset` から取得し、返された用途と制約に従う。

## 共通

- 英字だけの表示には `typography.family.latin`、和文を含む見出しと本文には
  `typography.family.body` を使う。Display、Heading、Bodyなど、`tokens/typography.json` の
  用途別ロールに対応させて階層を作る。
- 書体名と用途は `tokens/typography.json` のトークンを参照する。フォントファイル本体は
  配布物の `assets/fonts/` から取得し、MCPの `get_asset`（`font.latin` / `font.body`）は
  メタデータとライセンスの所在の確認に使う。
- `color.background.canvas` を基盤とし、Canvas相当の余白と白い面積を広く取る。
  `color.brand.primary` は一つの強いブランド表現へ絞り、`color.brand.secondary` と
  Extended ColorsはPrimaryより小さい面積で使う。
- ロゴ枠や会社名を示すブランド表示には `wordmark` 資産を使い、文字打ちで再現しない。
- 固有モチーフは `motif.brand` 資産を使い、`assets/manifest.json` の `usage` と
  `restrictions` に従う。写真や別の大きな抽象図形と主役を競わせない。

## スライド・提案書

- 一つのスライドには一つの主張を置く。
- 表紙はワードマークと一つの主張で構成する。
- 見出しと本文の階層には、タイポグラフィロールのDisplay、Heading、Bodyの関係を流用する。
- 余白は `spacing.*` から、隣接する要素同士の関係が伝わる最小の値を選ぶ。独自の中間値を
  足す前に、情報のグループ分けと階層を見直す。
- 強調は太字、色、大きさのいずれか一手だけを使い、同時に重ねない。

## 図解

- 一つの図には一つの主張を持たせる。
- 系列色は `color.data.series.*` の順で使う。四系列を超える図解は分割を検討する。
- 成功、警告、エラー、案内には対応する `color.status.*` のBackground・Foregroundを
  一組で使い、状態名または説明と識別可能なアイコンを併記する。Extended Colorsや
  `badge.*` を状態色として代用しない。
- 関係は、整理された階層、接続、反復で表す。発光、粒子、回路などを、AIらしさを足す
  背景装飾として使わない。
- 色だけで系列や関係を区別せず、ラベル、形、線種などを併用する。

## 避けること

- 見出し脇の装飾的なセクション番号を使わない。
- 等幅フォントを、小見出し、状態、日付などを技術的に見せる装飾として使わない。
- 四つの有彩色を一つの面で均等に使わない。系列識別が必要な図解だけを例外とする。
