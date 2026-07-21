const rounds = [
  {
    number: "00",
    phase: "Direction",
    title: "4象限ムードボード",
    description: "30の参照を4象限に配置し、中心にする方向と借りる要素を比較。第三者画像を載せない再構成版です。",
    result: "大胆・表現的を中心に、有機性と精密さを役割分担",
    href: "/archive/2026-07-21/00-moodboard-direction/",
  },
  {
    number: "01",
    phase: "Direction",
    title: "青系パレット",
    description: "同じB2B LPのヒーローで、青の温度・明度・強さを比較。ロゴ刷新前の初期地点です。",
    result: "寒色を軸に、強さと白い余白を両立する方向へ",
    href: "/archive/2026-07-21/01-blue-palette/",
  },
  {
    number: "02",
    phase: "Identity",
    title: "ロゴタイプ / Round 1",
    description: "4つの欧文書体で、Hashigodakaの力強さと人間味を支える文字骨格を比較。",
    result: "D（Sora）を基準案に選定",
    href: "/archive/2026-07-21/02-logo-round-01/",
  },
  {
    number: "03",
    phase: "Identity",
    title: "ロゴタイプ / Round 2",
    description: "Dに近い5書体を追加し、精密さ・親しみ・線の勢いを同じ条件で確認。",
    result: "6案からD・F・Hへ接近",
    href: "/archive/2026-07-21/03-logo-round-02/",
  },
  {
    number: "04",
    phase: "Identity",
    title: "ロゴタイプ / Shortlist",
    description: "周辺のLP表現へ進む前に、ワードマーク単体で有力な骨格だけを残した比較。",
    result: "D（Sora）・F（Outfit）・H（Geologica）",
    href: "/archive/2026-07-21/04-logo-round-03/",
  },
  {
    number: "05",
    phase: "Typography",
    title: "フォントペアリング",
    description: "英字ロゴ候補と日本語書体を総当たりし、線幅や仮名の角ばりまで拡大して比較。",
    result: "D–I と H–J の2組へ",
    href: "/archive/2026-07-21/05-font-pairing/",
  },
  {
    number: "06",
    phase: "Color",
    title: "Primary Color",
    description: "白の面積を広く保ち、ブランドの主色だけをパキッと使う条件で5案を比較。",
    result: "C（#00B8D9）とD（#00A0FF）を残す",
    href: "/archive/2026-07-21/06-primary-color/",
  },
  {
    number: "07",
    phase: "Color",
    title: "Secondary Color",
    description: "Primaryと隣接する面でSecondaryを比較。採否と色そのものを分けて読める表示も検証。",
    result: "C–F と D–E を固定",
    href: "/archive/2026-07-21/07-secondary-color/",
  },
  {
    number: "08",
    phase: "Color",
    title: "Extended + Neutral Colors",
    description: "拡張色に加え、背景・本文・薄い面のNeutralを実際のUIへ当てて4案を比較。",
    result: "D–E–Dをメイン候補に選定",
    href: "/archive/2026-07-21/08-extended-neutral-color/",
    featured: true,
  },
  {
    number: "09",
    phase: "Components",
    title: "ボタンの視覚的階層",
    description: "ブランドカラー型と、重要度を明快にするニュートラルな3階層を比較。",
    result: "黒・反転枠・下線の3階層を採用",
    href: "/archive/2026-07-21/09-button-hierarchy/",
  },
  {
    number: "10",
    phase: "Identity",
    title: "固有モチーフ探索",
    description: "Hの骨格、梯子、蝶、橋渡し・共創・成長を単色の一体形へ圧縮し、力強さと有機性を比較。",
    result: "01C-Cを暫定メイン候補とし、SVG初版を作成",
    href: "/archive/2026-07-21/10-motif-exploration/",
    featured: true,
  },
  {
    number: "TL",
    phase: "Process",
    title: "判断の時系列",
    description: "画面間で何が変わったかを、before / after / 理由で横断。失われた途中状態を推測せず補います。",
    result: "設計ブリーフとGit履歴から約50件を整理",
    href: "/archive/2026-07-21/process-timeline/",
  },
] as const;

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Hashigodaka Process Archive トップへ">
          Hashigodaka
        </a>
        <p>Design System / Process Archive</p>
        <a className="header-link" href="#rounds">全記録を見る <span aria-hidden="true">↓</span></a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="date">2026.07.21 — Work in progress</p>
          <h1>デザインは、<br />比較の跡から<br />強くなる。</h1>
          <p className="lead">
            Hashigodakaのデザインシステムをつくる過程で、何を並べ、何を外し、何を残したか。
            11の比較画面と判断の時系列を、検討の順番ごとに公開します。
          </p>
        </div>
        <div className="hero-visual" aria-label="現在のメイン候補 D-E-D のカラーパレット">
          <div className="visual-primary"><span>Primary</span><b>#00A0FF</b></div>
          <div className="visual-secondary"><span>Secondary</span><b>#C7F14A</b></div>
          <div className="visual-neutral"><span>Canvas</span><b>#FAF9FC</b></div>
          <div className="visual-caption">
            <span>Current main direction</span>
            <strong>D–E–D</strong>
          </div>
        </div>
      </section>

      <section className="intro">
        <p className="section-index">00 / How to read</p>
        <div>
          <h2>完成案だけでなく、<br />選ぶための比較面を残す。</h2>
          <p>
            01〜09は当時の操作可能なHTMLスナップショットです。00は第三者画像を再公開しない
            再構成版、判断の時系列は失われた中間状態をbefore / after / 理由で補う横断記録です。
            カードから実物を開き、色や書体の切り替え、拡大比較などを試せます。
          </p>
        </div>
      </section>

      <section className="round-section" id="rounds">
        <div className="rounds-heading">
          <p className="section-index">00–09 + Timeline / Process records</p>
          <h2>比較の記録</h2>
        </div>
        <div className="round-list">
          {rounds.map((round) => (
            <a
              className={`round-card${round.featured ? " featured" : ""}`}
              href={round.href}
              key={round.number}
            >
              <span className="round-number">{round.number}</span>
              <span className="round-phase">{round.phase}</span>
              <span className="round-copy">
                <strong>{round.title}</strong>
                <span>{round.description}</span>
              </span>
              <span className="round-result">{round.result}</span>
              <Arrow />
            </a>
          ))}
        </div>
      </section>

      <section className="current-direction">
        <p className="section-index">Current direction</p>
        <div className="current-copy">
          <h2>D–E–Dを主案に、<br />システム化へ。</h2>
          <p>
            現在は、鮮やかな青のPrimary、黄緑のSecondary、紫と橙のExtended Colors、
            白に近いCanvasと黒に近いInkを軸にガイドラインを構築中です。
            ロゴタイプと日本語書体はD–I / H–Jの2案を引き続き検証しています。
          </p>
        </div>
        <div className="palette" aria-label="D-E-D カラーパレット">
          <span style={{ background: "#00A0FF" }}><b>Primary</b>#00A0FF</span>
          <span className="dark-text" style={{ background: "#C7F14A" }}><b>Secondary</b>#C7F14A</span>
          <span style={{ background: "#6C4ED9" }}><b>Violet</b>#6C4ED9</span>
          <span className="dark-text" style={{ background: "#FF6B3D" }}><b>Orange</b>#FF6B3D</span>
          <span className="dark-text" style={{ background: "#FAF9FC" }}><b>Canvas</b>#FAF9FC</span>
          <span style={{ background: "#18151D" }}><b>Ink</b>#18151D</span>
        </div>
      </section>

      <footer>
        <div>
          <span className="wordmark">Hashigodaka</span>
          <p>Design System Process Archive</p>
        </div>
        <p>
          このサイトは制作途中の比較記録です。掲載するフォントは比較用に保存したもので、
          正式なブランド資産ではありません。
        </p>
      </footer>
    </main>
  );
}
