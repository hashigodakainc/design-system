# Design system status

## 利用可能な主案

- ブランドカラー：D-E-D
- Primary：`#00A0FF`
- Secondary：`#C7F14A`
- Extended：`#6C4ED9`、`#FF6B3D`
- 背景：`#FAF9FC`
- 文字：`#18151D`
- 薄い背景：`#ECE8F0`

これらは実装検証へ進める主案であり、最終確定前である。新しい制作物では検証目的で利用できるが、
外部配布用の恒久資産として固定する前に、B2B LPと図解で適用確認を行う。

## 利用可能なタイポグラフィ仕様

- Display、Heading 1〜3、Body Large・Body・Body Small、Label、Action、Caption、Code
- DesktopとMobileのサイズ
- 用途別のウェイト、行間、字間
- D-IとH-Jを同じ用途別スタイルへ適用する切り替え

用途別スタイルは検証利用できる。フォントファミリーは最終選定前のため、恒久的な製品実装へ
固定しない。詳細は [foundations/typography.md](foundations/typography.md) を参照する。

## 利用可能なボタン仕様

- Primary：黒背景と白文字
- Secondary：白背景、黒文字、グレー枠。ホバー時は明暗を反転
- Tertiary：透明背景、黒文字、黒下線

3階層と通常・ホバー・フォーカスの基本状態は利用できる。寸法バリエーション、無効・処理中状態、
アイコン併用は未策定。詳細は [components/buttons.md](components/buttons.md) を参照する。

## 利用可能なバッジ仕様

- Neutral：Surface背景、Ink文字、Neutral Border
- Color：Primary / Secondary / Violet / Orange系の専用トーン、Canvas相当の白文字

バッジの形状と色別バリエーションは利用できる。色付きバッジは白文字とのコントラストを満たす
専用トーンを使う。Success、Warning、Error、Infoとの意味対応は未策定。詳細は
[components/badges.md](components/badges.md) を参照する。

## 利用可能なレイアウト仕様

- 余白スケール：`0 / 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128px`
- ページ余白：Mobile `24px`、Tablet `48px`、Desktop `64px`
- グリッド：Mobile `4列`、Tablet `8列`、Desktop `12列`
- コンテンツ最大幅：Reading `720px`、Standard `1120px`、Wide `1440px`
- セクション間隔：Small `48px`、Medium `64px`、Large `96px`

基礎レイアウトは検証利用できる。ブレークポイントと用途別トークンを含む詳細は
[foundations/layout.md](foundations/layout.md) を参照する。

## 未決定

- フォントファミリー：D-I（Sora × LINE Seed JP）とH-J（Geologica × M PLUS 1）の最終選定
- 選定書体を調整した正式ワードマーク
- Success、Warning、Error、InfoのSemantic Colors
- Primary、Secondary、Extended Colorsの用途別濃淡
- 角丸、罫線、影、モーション
- 写真を使わない場面のHashigodaka固有モチーフ
- ボタン、バッジ以外のコンポーネント仕様と対応プラットフォーム
- ボタンの寸法バリエーション、無効・処理中状態、アイコン併用
- AIハーネス向け配布形式と再現性評価

## 構築順序

1. 主案D-E-Dの色トークンと実装例を運用する。
2. 用途別タイポグラフィを運用しながらD-IとH-Jを比較し、書体とロゴの土台を決める。
3. 採用済みの余白、グリッド、コンテンツ幅を実装で検証する。
4. Semantic Colorsを機能別に選ぶ。
5. 採用済みボタン・バッジ仕様を運用し、リンク、カード、ナビゲーション、図解などもコンポーネント化する。
6. 人間向けガイドとAI向け定義を同じ正本から配布し、別環境で再現性を検証する。
