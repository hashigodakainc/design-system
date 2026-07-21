# Process Archive Site

Hashigodaka Design Systemの制作過程を共有するSitesアプリ。

比較HTML、フォント、ライセンスの正本は `../../process-archive/2026-07-21/` に置く。
`public/archive/` は `npm run sync:archive` または `npm run build` のたびに正本から生成され、
Git管理しない。公開内容を修正するときは、生成先ではなく `process-archive/` を更新する。

Sitesプロジェクトの設定は `.openai/hosting.json` に保持する。
