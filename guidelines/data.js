/* Generated from tokens/*.json and assets/manifest.json. Do not edit directly. */
window.HSG_DATA = {
  "sources": [
    {
      "id": "colors",
      "label": "カラー",
      "status": "selected",
      "pending": [
        {
          "topic": "Semantic Colors（Success / Warning / Error / Info）",
          "until": "未選定。策定時期未定",
          "interim": "Extended Colorsやバッジ色で代用しない。バッジの色名は見た目のバリエーションであり、状態の意味を固定しない。"
        }
      ]
    },
    {
      "id": "typography",
      "label": "タイポグラフィ",
      "status": "selected",
      "pending": []
    },
    {
      "id": "layout",
      "label": "レイアウト",
      "status": "candidate",
      "pending": []
    }
  ],
  "tokens": {
    "colors": [
      {
        "name": "color.brand.primary",
        "cssVar": "--hsg-color-brand-primary",
        "value": "#00A0FF",
        "resolved": "#00A0FF",
        "description": "ブランドの主色。主役となるグラフィックやブランド表現へ限定して使う。"
      },
      {
        "name": "color.brand.secondary",
        "cssVar": "--hsg-color-brand-secondary",
        "value": "#C7F14A",
        "resolved": "#C7F14A",
        "description": "ブランドの補助色。主色より小さい面積で、ブランド表現の対比が必要な箇所へ使う。"
      },
      {
        "name": "color.brand.extended.violet",
        "cssVar": "--hsg-color-brand-extended-violet",
        "value": "#6C4ED9",
        "resolved": "#6C4ED9",
        "description": "図解やブランド表現を拡張する紫。"
      },
      {
        "name": "color.brand.extended.orange",
        "cssVar": "--hsg-color-brand-extended-orange",
        "value": "#FF6B3D",
        "resolved": "#FF6B3D",
        "description": "図解やブランド表現を拡張する橙。"
      },
      {
        "name": "color.neutral.canvas",
        "cssVar": "--hsg-color-neutral-canvas",
        "value": "#FAF9FC",
        "resolved": "#FAF9FC",
        "description": "ページ全体の背景。広い面積を確保する。"
      },
      {
        "name": "color.neutral.ink",
        "cssVar": "--hsg-color-neutral-ink",
        "value": "#18151D",
        "resolved": "#18151D",
        "description": "見出しと本文の基本文字色。"
      },
      {
        "name": "color.neutral.surface",
        "cssVar": "--hsg-color-neutral-surface",
        "value": "#ECE8F0",
        "resolved": "#ECE8F0",
        "description": "カード、図表、区切り面の薄い背景。"
      },
      {
        "name": "color.neutral.border",
        "cssVar": "--hsg-color-neutral-border",
        "value": "#DCD8E1",
        "resolved": "#DCD8E1",
        "description": "入力欄やSecondaryボタンなど、輪郭を穏やかに示す罫線。"
      },
      {
        "name": "color.neutral.muted",
        "cssVar": "--hsg-color-neutral-muted",
        "value": "#625D69",
        "resolved": "#625D69",
        "description": "補足情報と、Tertiaryボタンのホバー状態に使う控えめな文字色。"
      },
      {
        "name": "color.background.canvas",
        "cssVar": "--hsg-color-background-canvas",
        "value": "{color.neutral.canvas}",
        "resolved": "#FAF9FC",
        "description": "ページ背景の用途別トークン。"
      },
      {
        "name": "color.background.surface",
        "cssVar": "--hsg-color-background-surface",
        "value": "{color.neutral.surface}",
        "resolved": "#ECE8F0",
        "description": "カードや図表背景の用途別トークン。"
      },
      {
        "name": "color.background.brand",
        "cssVar": "--hsg-color-background-brand",
        "value": "{color.brand.primary}",
        "resolved": "#00A0FF",
        "description": "ブランド主色を背景として使う場合のトークン。"
      },
      {
        "name": "color.text.primary",
        "cssVar": "--hsg-color-text-primary",
        "value": "{color.neutral.ink}",
        "resolved": "#18151D",
        "description": "通常の見出しと本文。"
      },
      {
        "name": "color.text.on-brand",
        "cssVar": "--hsg-color-text-on-brand",
        "value": "{color.neutral.ink}",
        "resolved": "#18151D",
        "description": "PrimaryとSecondaryの色面上で使う文字色。"
      },
      {
        "name": "color.border.subtle",
        "cssVar": "--hsg-color-border-subtle",
        "value": "{color.neutral.border}",
        "resolved": "#DCD8E1",
        "description": "装飾的な区切り線。情報伝達を罫線だけに依存させない。"
      },
      {
        "name": "color.action.primary.background",
        "cssVar": "--hsg-color-action-primary-background",
        "value": "{color.neutral.ink}",
        "resolved": "#18151D",
        "description": "最重要アクションの黒い背景。ブランドのPrimary Colorとは独立した重要度の表現。"
      },
      {
        "name": "color.action.primary.foreground",
        "cssVar": "--hsg-color-action-primary-foreground",
        "value": "{color.neutral.canvas}",
        "resolved": "#FAF9FC",
        "description": "主要CTAの文字。"
      },
      {
        "name": "color.action.primary.border",
        "cssVar": "--hsg-color-action-primary-border",
        "value": "{color.neutral.ink}",
        "resolved": "#18151D",
        "description": "主要CTAの枠線。背景と同色にして強い面を作る。"
      },
      {
        "name": "color.action.primary.hover.background",
        "cssVar": "--hsg-color-action-primary-hover-background",
        "value": "#35313A",
        "resolved": "#35313A",
        "description": "主要CTAのホバー背景。階層を保ったまま黒のトーンを変える。"
      },
      {
        "name": "color.action.primary.hover.foreground",
        "cssVar": "--hsg-color-action-primary-hover-foreground",
        "value": "{color.neutral.canvas}",
        "resolved": "#FAF9FC",
        "description": "主要CTAのホバー文字。"
      },
      {
        "name": "color.action.primary.hover.border",
        "cssVar": "--hsg-color-action-primary-hover-border",
        "value": "{color.action.primary.hover.background}",
        "resolved": "#35313A",
        "description": "主要CTAのホバー枠線。"
      },
      {
        "name": "color.action.secondary.background",
        "cssVar": "--hsg-color-action-secondary-background",
        "value": "{color.neutral.canvas}",
        "resolved": "#FAF9FC",
        "description": "中重要度アクションの白い背景。"
      },
      {
        "name": "color.action.secondary.foreground",
        "cssVar": "--hsg-color-action-secondary-foreground",
        "value": "{color.neutral.ink}",
        "resolved": "#18151D",
        "description": "補助CTAの文字。"
      },
      {
        "name": "color.action.secondary.border",
        "cssVar": "--hsg-color-action-secondary-border",
        "value": "{color.neutral.border}",
        "resolved": "#DCD8E1",
        "description": "補助CTAのグレーの枠線。"
      },
      {
        "name": "color.action.secondary.hover.background",
        "cssVar": "--hsg-color-action-secondary-hover-background",
        "value": "{color.neutral.ink}",
        "resolved": "#18151D",
        "description": "補助CTAのホバー背景。通常状態の明暗を反転する。"
      },
      {
        "name": "color.action.secondary.hover.foreground",
        "cssVar": "--hsg-color-action-secondary-hover-foreground",
        "value": "{color.neutral.canvas}",
        "resolved": "#FAF9FC",
        "description": "補助CTAのホバー文字。"
      },
      {
        "name": "color.action.secondary.hover.border",
        "cssVar": "--hsg-color-action-secondary-hover-border",
        "value": "{color.neutral.ink}",
        "resolved": "#18151D",
        "description": "補助CTAのホバー枠線。"
      },
      {
        "name": "color.action.tertiary.foreground",
        "cssVar": "--hsg-color-action-tertiary-foreground",
        "value": "{color.neutral.ink}",
        "resolved": "#18151D",
        "description": "低重要度アクションの文字。"
      },
      {
        "name": "color.action.tertiary.underline",
        "cssVar": "--hsg-color-action-tertiary-underline",
        "value": "{color.neutral.ink}",
        "resolved": "#18151D",
        "description": "低重要度アクションを示す下線。"
      },
      {
        "name": "color.action.tertiary.hover.foreground",
        "cssVar": "--hsg-color-action-tertiary-hover-foreground",
        "value": "{color.neutral.muted}",
        "resolved": "#625D69",
        "description": "低重要度アクションのホバー文字。"
      },
      {
        "name": "color.action.tertiary.hover.underline",
        "cssVar": "--hsg-color-action-tertiary-hover-underline",
        "value": "{color.neutral.muted}",
        "resolved": "#625D69",
        "description": "低重要度アクションのホバー下線。"
      },
      {
        "name": "color.badge.neutral.background",
        "cssVar": "--hsg-color-badge-neutral-background",
        "value": "{color.neutral.surface}",
        "resolved": "#ECE8F0",
        "description": "未確定など、強い色を必要としないバッジの背景。"
      },
      {
        "name": "color.badge.neutral.foreground",
        "cssVar": "--hsg-color-badge-neutral-foreground",
        "value": "{color.neutral.ink}",
        "resolved": "#18151D",
        "description": "Neutralバッジの文字。"
      },
      {
        "name": "color.badge.neutral.border",
        "cssVar": "--hsg-color-badge-neutral-border",
        "value": "{color.neutral.border}",
        "resolved": "#DCD8E1",
        "description": "Neutralバッジの枠線。"
      },
      {
        "name": "color.badge.primary.background",
        "cssVar": "--hsg-color-badge-primary-background",
        "value": "#0070B8",
        "resolved": "#0070B8",
        "description": "Primary系バッジの背景。白文字を使える専用の濃いトーン。"
      },
      {
        "name": "color.badge.primary.foreground",
        "cssVar": "--hsg-color-badge-primary-foreground",
        "value": "{color.neutral.canvas}",
        "resolved": "#FAF9FC",
        "description": "Primary系バッジの白い文字。"
      },
      {
        "name": "color.badge.secondary.background",
        "cssVar": "--hsg-color-badge-secondary-background",
        "value": "#5F7800",
        "resolved": "#5F7800",
        "description": "Secondary系バッジの背景。白文字を使える専用の濃いトーン。"
      },
      {
        "name": "color.badge.secondary.foreground",
        "cssVar": "--hsg-color-badge-secondary-foreground",
        "value": "{color.neutral.canvas}",
        "resolved": "#FAF9FC",
        "description": "Secondary系バッジの白い文字。"
      },
      {
        "name": "color.badge.violet.background",
        "cssVar": "--hsg-color-badge-violet-background",
        "value": "{color.brand.extended.violet}",
        "resolved": "#6C4ED9",
        "description": "Violet系バッジの背景。"
      },
      {
        "name": "color.badge.violet.foreground",
        "cssVar": "--hsg-color-badge-violet-foreground",
        "value": "{color.neutral.canvas}",
        "resolved": "#FAF9FC",
        "description": "Violet系バッジの白い文字。"
      },
      {
        "name": "color.badge.orange.background",
        "cssVar": "--hsg-color-badge-orange-background",
        "value": "#B83A12",
        "resolved": "#B83A12",
        "description": "Orange系バッジの背景。白文字を使える専用の濃いトーン。"
      },
      {
        "name": "color.badge.orange.foreground",
        "cssVar": "--hsg-color-badge-orange-foreground",
        "value": "{color.neutral.canvas}",
        "resolved": "#FAF9FC",
        "description": "Orange系バッジの白い文字。"
      },
      {
        "name": "color.data.series.1",
        "cssVar": "--hsg-color-data-series-1",
        "value": "{color.brand.primary}",
        "resolved": "#00A0FF",
        "description": "図解・チャートの第1系列。"
      },
      {
        "name": "color.data.series.2",
        "cssVar": "--hsg-color-data-series-2",
        "value": "{color.brand.secondary}",
        "resolved": "#C7F14A",
        "description": "図解・チャートの第2系列。"
      },
      {
        "name": "color.data.series.3",
        "cssVar": "--hsg-color-data-series-3",
        "value": "{color.brand.extended.violet}",
        "resolved": "#6C4ED9",
        "description": "図解・チャートの第3系列。"
      },
      {
        "name": "color.data.series.4",
        "cssVar": "--hsg-color-data-series-4",
        "value": "{color.brand.extended.orange}",
        "resolved": "#FF6B3D",
        "description": "図解・チャートの第4系列。"
      }
    ],
    "typography": [
      {
        "name": "typography.family.candidate.di.heading",
        "cssVar": "--hsg-typography-family-candidate-di-heading",
        "value": "\"Hsg Candidate Sora\", sans-serif",
        "resolved": "\"Hsg Candidate Sora\", sans-serif",
        "description": "D-Iの英字見出し・ロゴ候補。"
      },
      {
        "name": "typography.family.candidate.di.body",
        "cssVar": "--hsg-typography-family-candidate-di-body",
        "value": "\"Hsg Candidate Line Seed JP\", sans-serif",
        "resolved": "\"Hsg Candidate Line Seed JP\", sans-serif",
        "description": "D-Iの和文本文・見出し候補。"
      },
      {
        "name": "typography.family.candidate.hj.heading",
        "cssVar": "--hsg-typography-family-candidate-hj-heading",
        "value": "\"Hsg Candidate Geologica\", sans-serif",
        "resolved": "\"Hsg Candidate Geologica\", sans-serif",
        "description": "H-Jの英字見出し・ロゴ候補。"
      },
      {
        "name": "typography.family.candidate.hj.body",
        "cssVar": "--hsg-typography-family-candidate-hj-body",
        "value": "\"Hsg Candidate M Plus 1\", sans-serif",
        "resolved": "\"Hsg Candidate M Plus 1\", sans-serif",
        "description": "H-Jの和文本文・見出し候補。"
      },
      {
        "name": "typography.family.code",
        "cssVar": "--hsg-typography-family-code",
        "value": "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        "resolved": "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        "description": "コードとコード識別子だけに使う。"
      },
      {
        "name": "typography.weight.candidate.di.heading",
        "cssVar": "--hsg-typography-weight-candidate-di-heading",
        "value": "700",
        "resolved": "700",
        "description": "D-Iの見出しウェイト。"
      },
      {
        "name": "typography.weight.candidate.hj.heading",
        "cssVar": "--hsg-typography-weight-candidate-hj-heading",
        "value": "800",
        "resolved": "800",
        "description": "H-Jの見出しウェイト。"
      },
      {
        "name": "typography.weight.body",
        "cssVar": "--hsg-typography-weight-body",
        "value": "400",
        "resolved": "400",
        "description": "本文の基本ウェイト。"
      },
      {
        "name": "typography.weight.emphasis",
        "cssVar": "--hsg-typography-weight-emphasis",
        "value": "700",
        "resolved": "700",
        "description": "強調、ラベル、操作のウェイト。"
      },
      {
        "name": "typography.size.display.desktop",
        "cssVar": "--hsg-typography-size-display-desktop",
        "value": "64px",
        "resolved": "64px",
        "description": "LPの主見出しなど、ページの主役となる表示。"
      },
      {
        "name": "typography.size.display.mobile",
        "cssVar": "--hsg-typography-size-display-mobile",
        "value": "44px",
        "resolved": "44px",
        "description": "モバイルのDisplay。"
      },
      {
        "name": "typography.size.heading.1.desktop",
        "cssVar": "--hsg-typography-size-heading-1-desktop",
        "value": "40px",
        "resolved": "40px",
        "description": "ページタイトル。"
      },
      {
        "name": "typography.size.heading.1.mobile",
        "cssVar": "--hsg-typography-size-heading-1-mobile",
        "value": "32px",
        "resolved": "32px",
        "description": "モバイルのページタイトル。"
      },
      {
        "name": "typography.size.heading.2.desktop",
        "cssVar": "--hsg-typography-size-heading-2-desktop",
        "value": "28px",
        "resolved": "28px",
        "description": "主要セクション見出し。"
      },
      {
        "name": "typography.size.heading.2.mobile",
        "cssVar": "--hsg-typography-size-heading-2-mobile",
        "value": "24px",
        "resolved": "24px",
        "description": "モバイルの主要セクション見出し。"
      },
      {
        "name": "typography.size.heading.3",
        "cssVar": "--hsg-typography-size-heading-3",
        "value": "20px",
        "resolved": "20px",
        "description": "カードや小セクションの見出し。"
      },
      {
        "name": "typography.size.body.large",
        "cssVar": "--hsg-typography-size-body-large",
        "value": "18px",
        "resolved": "18px",
        "description": "リード文、導入文。"
      },
      {
        "name": "typography.size.body.default",
        "cssVar": "--hsg-typography-size-body-default",
        "value": "16px",
        "resolved": "16px",
        "description": "標準本文。"
      },
      {
        "name": "typography.size.body.small",
        "cssVar": "--hsg-typography-size-body-small",
        "value": "14px",
        "resolved": "14px",
        "description": "補足本文。"
      },
      {
        "name": "typography.size.label",
        "cssVar": "--hsg-typography-size-label",
        "value": "13px",
        "resolved": "13px",
        "description": "意味のあるラベル、入力項目名。"
      },
      {
        "name": "typography.size.action",
        "cssVar": "--hsg-typography-size-action",
        "value": "15px",
        "resolved": "15px",
        "description": "ボタンと主要リンク。"
      },
      {
        "name": "typography.size.caption",
        "cssVar": "--hsg-typography-size-caption",
        "value": "12px",
        "resolved": "12px",
        "description": "注釈、出典、メタデータ。"
      },
      {
        "name": "typography.size.code",
        "cssVar": "--hsg-typography-size-code",
        "value": "14px",
        "resolved": "14px",
        "description": "コードとコード識別子。"
      },
      {
        "name": "typography.line-height.display",
        "cssVar": "--hsg-typography-line-height-display",
        "value": "1.12",
        "resolved": "1.12",
        "description": "Displayの行間。"
      },
      {
        "name": "typography.line-height.heading",
        "cssVar": "--hsg-typography-line-height-heading",
        "value": "1.35",
        "resolved": "1.35",
        "description": "見出しの行間。"
      },
      {
        "name": "typography.line-height.body",
        "cssVar": "--hsg-typography-line-height-body",
        "value": "1.8",
        "resolved": "1.8",
        "description": "和文本文の行間。"
      },
      {
        "name": "typography.line-height.compact",
        "cssVar": "--hsg-typography-line-height-compact",
        "value": "1.5",
        "resolved": "1.5",
        "description": "ラベル、操作、注釈の行間。"
      },
      {
        "name": "typography.line-height.code",
        "cssVar": "--hsg-typography-line-height-code",
        "value": "1.7",
        "resolved": "1.7",
        "description": "コードの行間。"
      },
      {
        "name": "typography.letter-spacing.display",
        "cssVar": "--hsg-typography-letter-spacing-display",
        "value": "-0.04em",
        "resolved": "-0.04em",
        "description": "大見出しの詰め。"
      },
      {
        "name": "typography.letter-spacing.heading",
        "cssVar": "--hsg-typography-letter-spacing-heading",
        "value": "-0.02em",
        "resolved": "-0.02em",
        "description": "見出しの詰め。"
      },
      {
        "name": "typography.letter-spacing.body",
        "cssVar": "--hsg-typography-letter-spacing-body",
        "value": "0",
        "resolved": "0",
        "description": "本文は書体本来の字間を使う。"
      },
      {
        "name": "typography.letter-spacing.label",
        "cssVar": "--hsg-typography-letter-spacing-label",
        "value": "0.04em",
        "resolved": "0.04em",
        "description": "小さいラベルの識別性を補う。"
      }
    ],
    "layout": [
      {
        "name": "space.0",
        "cssVar": "--hsg-space-0",
        "value": "0px",
        "resolved": "0px"
      },
      {
        "name": "space.1",
        "cssVar": "--hsg-space-1",
        "value": "4px",
        "resolved": "4px"
      },
      {
        "name": "space.2",
        "cssVar": "--hsg-space-2",
        "value": "8px",
        "resolved": "8px"
      },
      {
        "name": "space.3",
        "cssVar": "--hsg-space-3",
        "value": "12px",
        "resolved": "12px"
      },
      {
        "name": "space.4",
        "cssVar": "--hsg-space-4",
        "value": "16px",
        "resolved": "16px"
      },
      {
        "name": "space.5",
        "cssVar": "--hsg-space-5",
        "value": "24px",
        "resolved": "24px"
      },
      {
        "name": "space.6",
        "cssVar": "--hsg-space-6",
        "value": "32px",
        "resolved": "32px"
      },
      {
        "name": "space.7",
        "cssVar": "--hsg-space-7",
        "value": "48px",
        "resolved": "48px"
      },
      {
        "name": "space.8",
        "cssVar": "--hsg-space-8",
        "value": "64px",
        "resolved": "64px"
      },
      {
        "name": "space.9",
        "cssVar": "--hsg-space-9",
        "value": "96px",
        "resolved": "96px"
      },
      {
        "name": "space.10",
        "cssVar": "--hsg-space-10",
        "value": "128px",
        "resolved": "128px"
      },
      {
        "name": "layout.page.gutter.mobile",
        "cssVar": "--hsg-layout-page-gutter-mobile",
        "value": "{space.5}",
        "resolved": "24px"
      },
      {
        "name": "layout.page.gutter.tablet",
        "cssVar": "--hsg-layout-page-gutter-tablet",
        "value": "{space.7}",
        "resolved": "48px"
      },
      {
        "name": "layout.page.gutter.desktop",
        "cssVar": "--hsg-layout-page-gutter-desktop",
        "value": "{space.8}",
        "resolved": "64px"
      },
      {
        "name": "layout.content.indent",
        "cssVar": "--hsg-layout-content-indent",
        "value": "{space.8}",
        "resolved": "64px"
      },
      {
        "name": "layout.section.space.small",
        "cssVar": "--hsg-layout-section-space-small",
        "value": "{space.7}",
        "resolved": "48px"
      },
      {
        "name": "layout.section.space.medium",
        "cssVar": "--hsg-layout-section-space-medium",
        "value": "{space.8}",
        "resolved": "64px"
      },
      {
        "name": "layout.section.space.large",
        "cssVar": "--hsg-layout-section-space-large",
        "value": "{space.9}",
        "resolved": "96px"
      },
      {
        "name": "layout.content.width.reading",
        "cssVar": "--hsg-layout-content-width-reading",
        "value": "720px",
        "resolved": "720px"
      },
      {
        "name": "layout.content.width.standard",
        "cssVar": "--hsg-layout-content-width-standard",
        "value": "1120px",
        "resolved": "1120px"
      },
      {
        "name": "layout.content.width.wide",
        "cssVar": "--hsg-layout-content-width-wide",
        "value": "1440px",
        "resolved": "1440px"
      },
      {
        "name": "layout.grid.columns.mobile",
        "cssVar": "--hsg-layout-grid-columns-mobile",
        "value": "4",
        "resolved": "4"
      },
      {
        "name": "layout.grid.columns.tablet",
        "cssVar": "--hsg-layout-grid-columns-tablet",
        "value": "8",
        "resolved": "8"
      },
      {
        "name": "layout.grid.columns.desktop",
        "cssVar": "--hsg-layout-grid-columns-desktop",
        "value": "12",
        "resolved": "12"
      },
      {
        "name": "layout.grid.gutter.mobile",
        "cssVar": "--hsg-layout-grid-gutter-mobile",
        "value": "{space.4}",
        "resolved": "16px"
      },
      {
        "name": "layout.grid.gutter.tablet",
        "cssVar": "--hsg-layout-grid-gutter-tablet",
        "value": "{space.5}",
        "resolved": "24px"
      },
      {
        "name": "layout.grid.gutter.desktop",
        "cssVar": "--hsg-layout-grid-gutter-desktop",
        "value": "{space.5}",
        "resolved": "24px"
      },
      {
        "name": "radius.small",
        "cssVar": "--hsg-radius-small",
        "value": "2px",
        "resolved": "2px",
        "description": "バッジなど小さな要素の角丸。"
      },
      {
        "name": "radius.medium",
        "cssVar": "--hsg-radius-medium",
        "value": "4px",
        "resolved": "4px",
        "description": "矩形の明快さを保ちながら角の硬さだけを和らげる角丸。"
      },
      {
        "name": "radius.action",
        "cssVar": "--hsg-radius-action",
        "value": "{radius.medium}",
        "resolved": "4px",
        "description": "PrimaryとSecondaryボタンの角丸。ボックス形状を作らないTertiaryには使わない。"
      },
      {
        "name": "radius.badge",
        "cssVar": "--hsg-radius-badge",
        "value": "{radius.small}",
        "resolved": "2px",
        "description": "バッジの角丸。"
      },
      {
        "name": "focus.outline.width",
        "cssVar": "--hsg-focus-outline-width",
        "value": "3px",
        "resolved": "3px",
        "description": "キーボードフォーカスを示すInkアウトラインの太さ。"
      },
      {
        "name": "focus.outline.offset",
        "cssVar": "--hsg-focus-outline-offset",
        "value": "3px",
        "resolved": "3px",
        "description": "フォーカスアウトラインと要素の間隔。"
      },
      {
        "name": "layout.breakpoint.mobile",
        "cssVar": "--hsg-layout-breakpoint-mobile",
        "value": "760px",
        "resolved": "760px"
      },
      {
        "name": "layout.breakpoint.tablet",
        "cssVar": "--hsg-layout-breakpoint-tablet",
        "value": "1050px",
        "resolved": "1050px"
      },
      {
        "name": "layout.breakpoint.wide",
        "cssVar": "--hsg-layout-breakpoint-wide",
        "value": "1440px",
        "resolved": "1440px"
      },
      {
        "name": "layout.sidebar.width",
        "cssVar": "--hsg-layout-sidebar-width",
        "value": "268px",
        "resolved": "268px"
      },
      {
        "name": "layout.mobile-header.height",
        "cssVar": "--hsg-layout-mobile-header-height",
        "value": "62px",
        "resolved": "62px"
      }
    ]
  },
  "typographyRoles": [
    {
      "name": "display",
      "fontSize": "64px",
      "mobileFontSize": "44px",
      "fontWeight": "heading",
      "lineHeight": "1.12",
      "letterSpacing": "-0.04em"
    },
    {
      "name": "heading-1",
      "fontSize": "40px",
      "mobileFontSize": "32px",
      "fontWeight": "heading",
      "lineHeight": "1.35",
      "letterSpacing": "-0.02em"
    },
    {
      "name": "heading-2",
      "fontSize": "28px",
      "mobileFontSize": "24px",
      "fontWeight": "heading",
      "lineHeight": "1.35",
      "letterSpacing": "-0.02em"
    },
    {
      "name": "heading-3",
      "fontSize": "20px",
      "fontWeight": "heading",
      "lineHeight": "1.35",
      "letterSpacing": "-0.02em"
    },
    {
      "name": "body-large",
      "fontSize": "18px",
      "fontWeight": "400",
      "lineHeight": "1.8",
      "letterSpacing": "0"
    },
    {
      "name": "body",
      "fontSize": "16px",
      "fontWeight": "400",
      "lineHeight": "1.8",
      "letterSpacing": "0"
    },
    {
      "name": "body-small",
      "fontSize": "14px",
      "fontWeight": "400",
      "lineHeight": "1.8",
      "letterSpacing": "0"
    },
    {
      "name": "label",
      "fontSize": "13px",
      "fontWeight": "700",
      "lineHeight": "1.5",
      "letterSpacing": "0.04em"
    },
    {
      "name": "action",
      "fontSize": "15px",
      "fontWeight": "700",
      "lineHeight": "1.5",
      "letterSpacing": "0"
    },
    {
      "name": "caption",
      "fontSize": "12px",
      "fontWeight": "400",
      "lineHeight": "1.5",
      "letterSpacing": "0.04em"
    },
    {
      "name": "code",
      "fontSize": "14px",
      "fontWeight": "400",
      "lineHeight": "1.7",
      "letterSpacing": "0"
    }
  ],
  "assets": [
    {
      "id": "motif.01c-c",
      "kind": "motif",
      "label": "01C-C",
      "status": "approved",
      "path": "assets/motifs/01c-c.svg",
      "usage": [
        "写真がない場面の主役となるブランドグラフィック",
        "セクションの区切りや図解の記憶点"
      ],
      "restrictions": [
        "正式ロゴやファビコンとして使わない",
        "縦横比を変えない",
        "複数色へ分解しない",
        "回転、反転、輪郭の改変をしない",
        "32px未満では使わない"
      ],
      "pending": []
    }
  ]
};
