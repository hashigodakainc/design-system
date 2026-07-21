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

## 未決定

- フォントファミリー：D-I（Sora × LINE Seed JP）とH-J（Geologica × M PLUS 1）の最終選定
- 選定書体を調整した正式ワードマーク
- Success、Warning、Error、InfoのSemantic Colors
- Primary、Secondary、Extended Colorsの用途別濃淡
- 余白、グリッド、角丸、罫線、影、モーション
- 写真を使わない場面のHashigodaka固有モチーフ
- コンポーネントの仕様と対応プラットフォーム
- AIハーネス向け配布形式と再現性評価

## 構築順序

1. 主案D-E-Dの色トークンと実装例を運用する。
2. 用途別タイポグラフィを運用しながらD-IとH-Jを比較し、書体とロゴの土台を決める。
3. 余白、グリッドなどの基礎トークンを追加する。
4. Semantic Colorsを機能別に選ぶ。
5. ボタン、リンク、カード、ナビゲーション、図解などの実装例をコンポーネント化する。
6. 人間向けガイドとAI向け定義を同じ正本から配布し、別環境で再現性を検証する。
