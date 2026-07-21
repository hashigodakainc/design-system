# Typography

## 現在の位置づけ

用途別の文字階層、サイズ、行間、字間は、実装検証へ進める暫定仕様として利用できる。
フォントファミリーはD-I（Sora × LINE Seed JP）とH-J（Geologica × M PLUS 1）の
2候補を比較中であり、正式ロゴの調整とライセンス確認が終わるまで最終固定しない。

書体候補が変わっても情報階層が崩れないよう、利用側はフォント名や数値を直接指定せず、
用途別クラスとトークンを参照する。

## フォントの役割

- 日本語を含む見出し、本文、UIは、各候補の日本語書体を使う。
- SoraまたはGeologicaは、英字ワードマークと英字だけの表示を検証する候補とする。
- 正式ワードマークは未完成であり、候補書体で表示した `Hashigodaka` をロゴ資産として使わない。
- 等幅書体はコード、変数名、ファイル名など、コードとして読む識別子だけに使う。

## 用途別スタイル

| 用途 | CSSクラス | Desktop / Mobile | Weight | Line height | Letter spacing |
|---|---|---:|---:|---:|---:|
| Display | `.hsg-type-display` | 64 / 44px | 候補別 700・800 | 1.12 | -0.04em |
| Heading 1 | `.hsg-type-heading-1` | 40 / 32px | 候補別 700・800 | 1.35 | -0.02em |
| Heading 2 | `.hsg-type-heading-2` | 28 / 24px | 候補別 700・800 | 1.35 | -0.02em |
| Heading 3 | `.hsg-type-heading-3` | 20px | 候補別 700・800 | 1.35 | -0.02em |
| Body Large | `.hsg-type-body-large` | 18px | 400 | 1.8 | 0 |
| Body | `.hsg-type-body` | 16px | 400 | 1.8 | 0 |
| Body Small | `.hsg-type-body-small` | 14px | 400 | 1.8 | 0 |
| Label | `.hsg-type-label` | 13px | 700 | 1.5 | 0.04em |
| Action | `.hsg-type-action` | 15px | 700 | 1.5 | 0 |
| Caption | `.hsg-type-caption` | 12px | 400 | 1.5 | 0.04em |
| Code | `.hsg-type-code` | 14px | 400 | 1.7 | 0 |

サイズ表記が1件のものはDesktopとMobileで共通とする。Display、Heading 1、Heading 2は
760px以下でMobileサイズへ切り替える。

## 使い分け

### Display

LPの主見出しなど、ページに一つだけ置く最上位表現に使う。原則2〜3行までとし、長い説明を
Displayへ押し込まない。

### 見出し

Heading 1は記事・下層ページのタイトル、Heading 2は主要セクション、Heading 3はカードや
小セクションに使う。見た目を小さくしたいという理由だけでHTMLの見出し階層を飛ばさない。

### 本文

Body Largeはページ冒頭の導入、Bodyは標準本文、Body Smallは補足説明に使う。標準本文は
和文35〜45字程度の行長を目安にし、重要情報をBody Smallへ押し込まない。

### UIと注釈

Labelは入力項目名や意味のある分類、Actionはボタンと主要リンク、Captionは日付、出典、
画像注釈に使う。装飾だけの英大文字ラベルを追加せず、動作や分類を日本語で具体的に示す。

### Code

Codeはコード、CSS変数、コマンド、ファイル名などに限定する。ラベル、状態、日付、HEX値を
技術的に見せる装飾として等幅書体を使わない。

## 実装

`styles/tokens.css` と `styles/typography.css` を読み込む。

```css
@import "path/to/design-system/styles/tokens.css";
@import "path/to/design-system/styles/typography.css";
```

比較中の書体ペアは、ルート要素の属性で切り替える。

```html
<html data-hsg-font-pair="di">
  <h1 class="hsg-type-heading-1">構想を、動く仕組みに変える。</h1>
  <p class="hsg-type-body">事業と技術の間をつなぎます。</p>
</html>
```

`data-hsg-font-pair` は `di` または `hj` を指定できる。未指定時は比較用の初期値として
`di` を使うが、これは最終採用を意味しない。

機械可読な正本は [`tokens/typography.json`](../../tokens/typography.json) とする。

## アクセシビリティと組版

- 文字サイズだけでなく、HTMLの見出し構造を正しく保つ。
- 本文の拡大や書体読み込み失敗時にも、内容が欠けないレイアウトにする。
- 情報を太字、色、サイズの組み合わせだけで区別しない。
- ボタンやリンクは動作が予測できる具体的な文言にする。
- 日本語本文は行間1.8を基本とし、長文の密度を上げすぎない。

## 未決事項

- D-IとH-Jの最終選定
- 正式ワードマークの字形、字間、接続
- フォントの取得元、版、Web配信を含むライセンス境界
- 数字、英字、長文記事、表、フォームでの追加検証
