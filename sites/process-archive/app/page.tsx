const systemRounds = [
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

const siteRounds = [
  { number: "00", phase: "Site direction", title: "ホームページ全体の方向", description: "完成イメージ9案から、人物と実務を主役にする方向を比較。", result: "3「人と実務」を基準方向に選定", href: "/archive/2026-07-22/00-homepage-direction/", featured: true },
  { number: "01", phase: "Hero", title: "ファーストビュー", description: "写真、2行コピー、01C-Cの面積と重なりをA〜Eで比較。", result: "大判写真窓のEを採用", href: "/archive/2026-07-22/01-first-view-exploration/" },
  { number: "02", phase: "Service", title: "サービスイラスト / Round 1", description: "人物を使ったサービス1の画風と構図を最初に発散。", result: "写実寄りを避け、フラット表現へ", href: "/archive/2026-07-22/02-service-illustration-round-01/" },
  { number: "03", phase: "Service", title: "サービスイラスト / Round 2", description: "人体比率とデフォルメ度を広げ、D〜Hを比較。", result: "Hの画風を基準に選定", href: "/archive/2026-07-22/03-service-illustration-round-02/" },
  { number: "04", phase: "Service", title: "サービス2の共同開発構図", description: "サービス1と構図を分け、2者が協力する動きをI〜Lで比較。", result: "共有画面へ働きかけるLを採用", href: "/archive/2026-07-22/04-service-02-composition/" },
  { number: "05", phase: "Service", title: "サービス3の握手構図", description: "握手とAI・業務フローを一体化するM〜Pを比較。", result: "新しい流れへ接続するPを採用", href: "/archive/2026-07-22/05-service-03-composition/" },
  { number: "06", phase: "Overview", title: "3事業の俯瞰図", description: "3事業を説明するレイヤー、フロー、モチーフ構成を比較。", result: "複雑な説明図から幾何学へ移行", href: "/archive/2026-07-22/06-service-overview-diagram/" },
  { number: "07", phase: "Overview", title: "幾何学構造", description: "SVGで3事業を単純化し、独立性の表現を検証。", result: "意味の抽象化をやめ、同格性だけへ", href: "/archive/2026-07-22/07-service-overview-geometry/" },
  { number: "08", phase: "Overview", title: "スクロール強調", description: "非接触の3円と、現在の事業を円周で強調する状態を比較。", result: "一度Aを適用後、俯瞰コピーへ置換", href: "/archive/2026-07-22/08-service-overview-active-state/" },
  { number: "09", phase: "Team", title: "チームの情報設計", description: "写真を使わずプロフィール全文を見せるA〜Cを比較。", result: "非対称2カラムのCを採用", href: "/archive/2026-07-22/09-team-layout/" },
  { number: "10", phase: "Team", title: "Teamの大判モチーフ", description: "空いた左カラムへ01C-Cを切り取って置く構成を比較。", result: "画面左端で切るAを採用", href: "/archive/2026-07-22/10-team-motif/" },
  { number: "11", phase: "News", title: "Newsの情報階層とモチーフ", description: "一件の記事を見せるA〜Jと、大判01C-Cの配置を比較。", result: "下端クロップ型のJを採用", href: "/archive/2026-07-22/11-news-layout/", featured: true },
  { number: "TL", phase: "Process", title: "サイト再設計の判断タイムライン", description: "セクションをまたぐ判断変更をbefore / after / 理由で整理。", result: "全体方向からNews採用までを横断", href: "/archive/2026-07-22/process-timeline/" },
] as const;

const keyVisualRounds = [
  { number: "00", phase: "Brand direction", title: "ブランド起点のキービジュアル", description: "企業の意思とAI時代の実装力の断絶を、01C-Cでつなぐ3方向を比較。", result: "写真を外し、大判モチーフを主役にする", href: "/archive/2026-07-24/00-key-visual-brand-direction/", featured: true },
  { number: "01", phase: "Motion", title: "モチーフの状態変化", description: "Z軸方向へ倒した01C-Cで、無色からブランドカラーへ移る質感と動きを比較。", result: "粒子のEと拡散境界のGへ", href: "/archive/2026-07-24/01-key-visual-motif-motion/" },
  { number: "02", phase: "Finalists", title: "E / G 最終比較", description: "大きさ、追従光、背景、コピーの出現方法をE/Gへ絞って調整。", result: "E3を採用。Gの背景はOur Conceptへ", href: "/archive/2026-07-24/02-key-visual-finalists/", featured: true },
  { number: "TL", phase: "Process", title: "ブランド起点の判断タイムライン", description: "ブランド基盤、D-I確定、キービジュアルの採否をbefore / after / 理由で整理。", result: "意思から実装へつなぐE方向に収束", href: "/archive/2026-07-24/process-timeline/" },
] as const;

const informationArchitectureRounds = [
  { number: "00", phase: "Our Concept", title: "Conceptの背景方向", description: "Hero後の考え方を、01C-Cと本文の関係が異なる3方向で比較。", result: "「作れる」を「届けられる」へつなぐA方向", href: "/archive/2026-07-28/00-our-concept-visual/" },
  { number: "01", phase: "Our Concept", title: "ConceptのHTML実装", description: "背景画像、本文、行単位リヴィールを実ページ相当の組版で比較。", result: "通常フローのA方向を採用", href: "/archive/2026-07-28/01-our-concept-html/", featured: true },
  { number: "02", phase: "Service", title: "サービスの視覚方向", description: "3サービスを同じ背景上でどう一覧化するかを比較。", result: "カード先行から情報設計の再検討へ", href: "/archive/2026-07-28/02-service-visual-direction/" },
  { number: "03", phase: "Service", title: "1サービス＝1モチーフ", description: "意図と解決策を01C-Cの左右へ置く構造を検証。", result: "モチーフ内へ情報を押し込まない", href: "/archive/2026-07-28/03-service-motif-structure/" },
  { number: "04", phase: "Service", title: "代替構造の探索", description: "モチーフ依存を弱め、意図と解決策を結ぶ複数構造を比較。", result: "顧客が読む順序を優先", href: "/archive/2026-07-28/04-service-alternative-structures/" },
  { number: "05", phase: "Service", title: "対象組織＋詳細", description: "どんな組織へ何を支援するかを先に示す全体像を検証。", result: "対象と課題の後にサービス詳細", href: "/archive/2026-07-28/05-service-audience-detail/" },
  { number: "06", phase: "Service", title: "3支援領域の詳細", description: "サービス名、説明、支援内容を顧客の語彙で整理。", result: "3領域の差を名称と対象で分離", href: "/archive/2026-07-28/06-service-lines-detail/" },
  { number: "07", phase: "Service", title: "二層構成の確定", description: "上段の全体像と下段の縦並び詳細を一つの比較面へ。", result: "二層構成を固定", href: "/archive/2026-07-28/07-service-final-structure/" },
  { number: "08", phase: "Service", title: "課題起点の再構成", description: "共感から解決策へ進む情報の順序を複数案で比較。", result: "悩みと解決状態の対応を先に示す", href: "/archive/2026-07-28/08-service-reframed/" },
  { number: "09", phase: "Service", title: "スクロール構造", description: "上下の状態をスクロールで読み進める構成を検証。", result: "強調点が曖昧なため不採用", href: "/archive/2026-07-28/09-service-scroll-structure/" },
  { number: "10", phase: "Service", title: "二層構成の視覚処理", description: "確定した情報構造を保ち、背景と強調方法だけを比較。", result: "背景装飾のないC方向", href: "/archive/2026-07-28/10-service-visual-treatment/" },
  { number: "11", phase: "Service", title: "AS IS / TO BE", description: "課題と解決状態を同じ列で対応させる表構造を作成。", result: "列対応のAS IS / TO BEへ", href: "/archive/2026-07-28/11-service-asis-tobe-structure/" },
  { number: "12", phase: "Service", title: "AS IS / TO BEの調整", description: "実ページ相当の文字量、余白、モバイル表示を調整。", result: "概要と個別詳細の役割を分離", href: "/archive/2026-07-28/12-service-asis-tobe-refinement/", featured: true },
  { number: "TL", phase: "Process", title: "情報設計・実装の判断タイムライン", description: "Our ConceptからNewsまで、7月25〜28日の判断変更を横断。", result: "装飾から理解の順序へ", href: "/archive/2026-07-28/process-timeline/" },
] as const;

const rounds = [...systemRounds, ...siteRounds, ...keyVisualRounds, ...informationArchitectureRounds];

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
          <p className="date">2026.07.21–28 — Work in progress</p>
          <h1>デザインは、<br />比較の跡から<br />強くなる。</h1>
          <p className="lead">
            Hashigodakaのデザインシステムをつくる過程で、何を並べ、何を外し、何を残したか。
            39の比較画面と4つの判断タイムラインを、検討の順番ごとに公開します。
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
            2026-07-21のデザインシステム策定、07-22〜23のサイト再設計、07-24の
            ブランド起点のキービジュアル再設計、07-25〜28の情報設計・実装で使った操作可能な
            HTMLスナップショットです。判断の時系列は失われた中間状態をbefore / after / 理由で補います。
            カードから実物を開き、色や書体の切り替え、拡大比較などを試せます。
          </p>
        </div>
      </section>

      <section className="round-section" id="rounds">
        <div className="rounds-heading">
          <p className="section-index">2026.07.21–28 / 39 comparisons + 4 timelines</p>
          <h2>比較の記録</h2>
        </div>
        <div className="round-list">
          {rounds.map((round) => (
            <a
              className={`round-card${round.featured ? " featured" : ""}`}
              href={round.href}
              key={round.href}
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
            ロゴタイプと日本語書体はD–I（Sora × LINE Seed JP）へ確定しました。
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
