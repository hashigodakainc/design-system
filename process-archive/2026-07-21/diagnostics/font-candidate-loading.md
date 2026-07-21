# 日本語フォント候補の読み込み診断

## 位置づけ

これは日本語フォント候補をブラウザで読み込めるか確認した内部診断の記録であり、
書体の選定画面や正式なブランド資産ではない。元の一時ページは次に残っていた。

`/tmp/codex-html-preview/019f8259-a3de-77e3-adad-7000eb6a12ce/font-pairing-round-01/font-candidates.html`

一時領域は永続性がなく、候補ファイルの公式配布元・版・再配布条件も十分に確認できていない。
そのためバイナリはこの診断ディレクトリへ複製せず、同定に必要な情報だけを保存する。

## 確認できた候補

| 一時ファイル名 | SHA-256 | `fc-scan`で確認したFamily / Style |
|---|---|---|
| `candidate-dela.ttf` | `4ff87a0965f1b0505e5a2c58424bc6ad3cff27e56a82f21c2fc9d6b0e3857ee2` | Dela Gothic One / Regular |
| `candidate-line-bold.ttf` | `67aec2dc10b3ad210d6f7d53b33bbfea42ea28e32fa3834624eee699a638d5ff` | LINE Seed JP / Bold |
| `candidate-mplus1.ttf` | `32dab296a06c3e87841ecd2bc9912434a964ad541e22ea19f764969dae93fced` | M PLUS 1, M PLUS 1 Thin / Thin, Regular |
| `candidate-shippori.ttf` | `b88fd5138c77c1359406051786d45c88ab34e2040c6dfa385f00a4e17edaab52` | Shippori Antique / Regular |
| `jp-c-extrabold.ttf` | `d17f745712668b0dcd95e42b3634a90a76195228d4abf88a0be8e98ddbc441b2` | M PLUS 1p ExtraBold |
| `jp-f.ttf` | `3a273c2f11e0164f829bc15c0689e587fe34d1493ff167d5afff8fe71a29e667` | Murecho Thin |
| `jp-h.ttf` | `2e4f45c2391355fb03195da4854ffbe85fea49bfdff5cc51020238083af6b75c` | M PLUS 2 Thin |

## 公開境界

- 採用比較に現在も必要な共有フォントは `../assets/fonts/` と対応ライセンスで管理する。
- この診断にだけ現れた候補は、公式配布元、バージョン、ライセンスとの対応が未確認である。
- この記録はGitには残すが、公開Sitesの生成時には `diagnostics/` 全体を除外する。
- 再検証する場合はハッシュを照合し、公式配布元から取得し直したファイルで比較する。
