# Changelog

## Unreleased

### Breaking: Typography・Layout トークン再編

- Typographyのプリミティブを値由来名へ統一し、用途は既存の`.hsg-type-*`ロールへ集約した。
- 余白プリミティブを`space.*`から`spacing.*`へ変更した。
- breakpointを`*-max`へ変更し、CSS変数としての出力を廃止した。生成CSSのメディアクエリには
  `layout.breakpoint.mobile-max`の解決値を直接埋め込む。
- 角丸、境界線、フォーカス輪郭を`tokens/shape.json`へ分離した。これらのトークン名は変わらない。
- 後方互換エイリアスは提供しない。旧名の再導入は移行リリース中のCIで拒否する。
- `.hsg-type-*`と全コンポーネントCSSの解決後スタイルは、改訂前のスナップショットと一致する。

#### Typography

| 旧名 | 新名 |
| --- | --- |
| `typography.size.caption` | `typography.size.12` |
| `typography.size.label` | `typography.size.13` |
| `typography.size.body.small` / `typography.size.code` | `typography.size.14` |
| `typography.size.label-large` | `typography.size.15` |
| `typography.size.body.default` | `typography.size.16` |
| `typography.size.heading.4` / `typography.size.body.large` | `typography.size.18` |
| `typography.size.heading.3` | `typography.size.20` |
| `typography.size.heading.2.mobile` | `typography.size.24` |
| `typography.size.heading.2.desktop` | `typography.size.28` |
| `typography.size.heading.1.mobile` | `typography.size.32` |
| `typography.size.heading.1.desktop` | `typography.size.40` |
| `typography.size.display.mobile` | `typography.size.44` |
| `typography.size.display.desktop` | `typography.size.64` |
| `typography.weight.body` | `typography.weight.400` |
| `typography.weight.heading` / `typography.weight.emphasis` | `typography.weight.700` |
| `typography.line-height.display` | `typography.line-height.112` |
| `typography.line-height.heading` | `typography.line-height.135` |
| `typography.line-height.compact` | `typography.line-height.150` |
| `typography.line-height.code` | `typography.line-height.170` |
| `typography.line-height.body` | `typography.line-height.180` |
| `typography.letter-spacing.display` | `typography.tracking.tighter` |
| `typography.letter-spacing.heading` | `typography.tracking.tight` |
| `typography.letter-spacing.body` | `typography.tracking.normal` |
| `typography.letter-spacing.label` | `typography.tracking.wide` |

#### Layout

| 旧名 | 新名 |
| --- | --- |
| `space.0` | `spacing.0` |
| `space.1` | `spacing.4` |
| `space.2` | `spacing.8` |
| `space.3` | `spacing.12` |
| `space.4` | `spacing.16` |
| `space.5` | `spacing.24` |
| `space.6` | `spacing.32` |
| `space.7` | `spacing.48` |
| `space.8` | `spacing.64` |
| `space.9` | `spacing.96` |
| `space.10` | `spacing.128` |
| `layout.breakpoint.mobile` | `layout.breakpoint.mobile-max` |
| `layout.breakpoint.tablet` | `layout.breakpoint.tablet-max` |
| `layout.breakpoint.wide` | `layout.breakpoint.desktop-max` |
| `layout.mobile-header.height` | `layout.header.height.mobile` |
