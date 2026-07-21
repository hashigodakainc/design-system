# デザインシステム比較プロセス・アーカイブ（2026-07-21）

## このアーカイブの目的

2026-07-21の比較セッションで作成したローカルHTMLを、後日の記事化や判断過程の検証に使える
一次資料として保存する。ここには記事本文を置かない。公開記事は別リポジトリのワークフローで
編集する。

01〜09のHTMLは一時プレビューに残っていた最終状態のスナップショットである。00は、第三者の
スクリーンショットを再公開せず方向性検証を残すため、当時の参照リストと判断記録から再構成した。
同一HTMLを更新しながら比較してきたため、各ラウンド内の全中間状態は残っていない。細かな
追加・除外の順序と理由は、判断の時系列、`docs/design-brief.md`、Git履歴を併せて確認する。

## 比較の順序

| 順序 | 保存先 | 目的 | 現在残っている状態 | 主なコミット |
|---|---|---|---|---|
| 0 | [`00-moodboard-direction/`](00-moodboard-direction/) | 4象限でブランドの視覚的方向性を比較する | 30の参照先と選定理由を、第三者画像を含めず再構成した公開用記録 | `docs/visual-references.md`と判断記録から再構成 |
| 1 | [`01-blue-palette/`](01-blue-palette/) | 同じB2B LPヒーローで青系パレットを比較する | 青系3パレットを切り替える初期比較。現行ロゴを含む、ロゴ刷新方針確定前の状態 | `74be435`（現行ロゴを比較から外す判断） |
| 2 | [`02-logo-round-01/`](02-logo-round-01/) | 英字ワードマークの最初の骨格を比較する | A〜D：Space Grotesk、Manrope、Bricolage Grotesque、Sora | `35567dc`（SoraのDを基準案に） |
| 3 | [`03-logo-round-02/`](03-logo-round-02/) | Dを基準に近い骨格の候補を追加比較する | D〜I：Sora、Plus Jakarta Sans、Outfit、Onest、Geologica、Albert Sans | `35567dc`、`82548a5` |
| 4 | [`04-logo-round-03/`](04-logo-round-03/) | ロゴ単体の候補を3案へ絞る | D（Sora）、F（Outfit）、H（Geologica） | `82548a5` |
| 5 | [`05-font-pairing/`](05-font-pairing/) | ロゴタイプと日本語書体を組み合わせて比較する | 最終候補D-IとH-Jを中心に、除外済み組み合わせも判断経緯として表示 | `9f24f1e`〜`8b29337` |
| 6 | [`06-primary-color/`](06-primary-color/) | 書体ペアを固定し、ブランドの主色だけを比較する | C（#00B8D9）とD（#00A0FF）を含む、明るくビビッドな主色5案 | `1c82982`〜`b95a264` |
| 7 | [`07-secondary-color/`](07-secondary-color/) | Primaryと隣接させてSecondaryを比較する | Main C-F（#476A7A）とMain D-E（#C7F14A）を固定。不採用カードの配色面は色を残し、枠・見出し・操作のみ灰色化 | `8b4ad24`、`9852f93`、`3e07a45`と、その後のC-F絞り込み |
| 8 | [`08-extended-neutral-color/`](08-extended-neutral-color/) | Extended Colorsと背景・文字・薄い背景を同じ適用見本で比較する | 候補4案を既定表示。書体ペアを切り替え可能。D-E-Dを主案として選定した時点の最終状態 | `32fc89c`〜`a79d3b7`、`f4ca362` |
| 9 | [`09-button-hierarchy/`](09-button-hierarchy/) | ボタンのブランドカラー案とニュートラルな3階層案を比較する | 枠線型・塗り型のPrimary / Secondary Color案と、採用したPrimary / Secondary / Tertiaryの3階層案 | 案3採用時のコミット |
| 横断 | [`process-timeline/`](process-timeline/) | 各画面の間で変わった判断を追う | 約50件のbefore / after / 理由を、確認できる記録だけから時系列化 | `docs/design-brief.md`とGit履歴 |

## 閲覧方法

リポジトリのルートをHTTPサーバーで配信し、各ディレクトリの `index.html` を開く。HTMLを
直接 `file://` で開くより、フォント読み込みの挙動を再現しやすい。

すべてのラウンドは共有資産 [`assets/fonts/`](assets/fonts/) を参照する。元の一時プレビューに
複数コピーされていた同一フォントはSHA-256で照合し、1ファイルへ集約した。

## 資産とライセンス

- フォント本体の一覧、SHA-256、対応ライセンスは [`assets/fonts/README.md`](assets/fonts/README.md) に記載する。
- 一時プレビューに同梱されていたライセンス本文は [`assets/licenses/`](assets/licenses/) に保存した。
- 全フォントにSIL Open Font License 1.1の本文が対応している。ただし、一時プレビューには
  **取得元URL、取得日、リリースタグ、フォントファイルとライセンスの入手経路**が残っていない。
  記事公開またはリポジトリ公開前に、各フォントの公式配布元とバージョンを照合し、再配布条件、
  Reserved Font Nameの有無、クレジット表記を確認すること。
- とくにLINE Seed JPはライセンス本文に「© LY Corporation」とあるが、保存ファイルの正確な
  配布元・版が記録されていないため要確認とする。

## 保存範囲の制約

- 公開対象は10段階の比較HTML、判断の時系列、それらが現在参照するローカルフォント・
  ライセンスである。
- 元のムードボードに含まれた第三者サイトのスクリーンショットやロゴは再公開せず、URL、観察、
  判断だけを権利面に配慮した再構成版へ残した。
- 日本語フォント候補の読み込み診断は [`diagnostics/font-candidate-loading.md`](diagnostics/font-candidate-loading.md)
  にハッシュと同定結果だけを内部記録した。候補バイナリは複製せず、`diagnostics/`はSites公開から除外する。
- 失われた各ラウンド内の中間ピクセル状態は推測で再現せず、確認できるbefore / after / 理由を
  `process-timeline/`で補完した。
- 一時プレビューの比較UIは本番実装ではない。
- 初期青パレットはロゴ刷新方針が固まる前の資料であり、現在のブランド判断を示すものではない。
