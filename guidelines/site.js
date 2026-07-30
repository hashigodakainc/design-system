const menuButton = document.querySelector('.menu-button');
const sidebar = document.querySelector('.sidebar');
const navLinks = [...document.querySelectorAll('nav a')];

menuButton?.addEventListener('click', () => {
  const open = sidebar.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(open));
});

navLinks.forEach((link) => link.addEventListener('click', () => {
  sidebar.classList.remove('is-open');
  menuButton?.setAttribute('aria-expanded', 'false');
}));

const sections = [...document.querySelectorAll('main section[id]')];
const linkById = new Map(navLinks.map((link) => [link.hash.slice(1), link]));
const observer = new IntersectionObserver((entries) => {
  const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  navLinks.forEach((link) => link.classList.remove('is-active'));
  linkById.get(visible.target.id)?.classList.add('is-active');
}, { rootMargin: '-20% 0px -65% 0px', threshold: [0, .2, .6] });

sections.forEach((section) => observer.observe(section));

/* ---- 正本JSONから生成した data.js（window.HSG_DATA）の描画 ---- */

const data = window.HSG_DATA;

const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
};

const tokenByName = new Map(
  Object.values(data.tokens).flat().map((token) => [token.name, token]),
);

const displayName = (name) => name.split('.').pop()
  .replace(/(^|-)([a-z])/g, (_, sep, ch) => (sep ? ' ' : '') + ch.toUpperCase());

const renderSwatch = (token, kind) => {
  const article = el('article', kind);
  const color = el(kind === 'swatch' ? 'div' : 'span', kind === 'swatch' ? 'swatch-color' : '');
  color.style.background = `var(${token.cssVar})`;
  const body = el('div');
  body.append(
    el('p', '', displayName(token.name)),
    el('strong', '', token.resolved.toUpperCase()),
    el('small', '', token.description ?? ''),
  );
  article.append(color, body);
  return article;
};

const brandContainer = document.querySelector('[data-render="brand-swatches"]');
const neutralContainer = document.querySelector('[data-render="neutral-swatches"]');
if (brandContainer) {
  data.tokens.colors
    .filter((token) => token.name.startsWith('color.brand.'))
    .forEach((token) => brandContainer.append(renderSwatch(token, 'swatch')));
}
if (neutralContainer) {
  data.tokens.colors
    .filter((token) => ['color.neutral.canvas', 'color.neutral.ink', 'color.neutral.surface'].includes(token.name))
    .forEach((token) => neutralContainer.append(renderSwatch(token, 'neutral')));
}

const stripUnit = (value) => value.replace(/px$/, '');
const roleByClass = new Map(data.typographyRoles.map((role) => [`.hsg-type-${role.name}`, role]));
document.querySelectorAll('.type-role').forEach((article) => {
  const code = article.querySelector('.type-role-name code')?.textContent;
  const dl = article.querySelector('[data-render="role-specs"]');
  const role = roleByClass.get(code);
  if (!dl || !role) return;
  const specs = [
    ['Size', role.mobileFontSize ? `${stripUnit(role.fontSize)} / ${stripUnit(role.mobileFontSize)}` : stripUnit(role.fontSize)],
    ['Line', role.lineHeight],
    role.letterSpacing !== '0'
      ? ['Tracking', role.letterSpacing.replace('-', '−')]
      : ['Weight', role.fontWeight === 'heading' ? tokenByName.get('typography.weight.candidate.di.heading')?.resolved : role.fontWeight],
  ];
  specs.forEach(([term, value]) => {
    const wrap = el('div');
    wrap.append(el('dt', '', term), el('dd', '', value));
    dl.append(wrap);
  });
});

const typographyPending = document.querySelector('[data-render="typography-pending"]');
if (typographyPending) {
  const pending = data.sources.find((source) => source.id === 'typography')?.pending ?? [];
  typographyPending.textContent = pending.map((entry) => entry.interim).join(' ');
}

const spaceScale = document.querySelector('[data-render="space-scale"]');
if (spaceScale) {
  data.tokens.layout
    .filter((token) => /^space\.\d+$/.test(token.name) && token.resolved !== '0px')
    .sort((a, b) => parseInt(a.resolved, 10) - parseInt(b.resolved, 10))
    .forEach((token) => {
      const item = el('div');
      const bar = el('span');
      bar.style.setProperty('--space-size', token.resolved);
      item.append(bar, el('strong', '', stripUnit(token.resolved)));
      spaceScale.append(item);
    });
}

document.querySelectorAll('[data-layout-values]').forEach((node) => {
  const values = node.dataset.layoutValues.split(',')
    .map((name) => tokenByName.get(name.trim())?.resolved ?? '?');
  const allPx = values.every((value) => /px$/.test(value));
  const joined = allPx ? `${values.map(stripUnit).join(' / ')}px` : values.join(' / ');
  node.textContent = joined + (node.dataset.layoutSuffix ?? '');
});

const breakpointNote = document.querySelector('[data-render="breakpoint-note"]');
if (breakpointNote) {
  const mobile = tokenByName.get('layout.breakpoint.mobile')?.resolved;
  const tablet = tokenByName.get('layout.breakpoint.tablet')?.resolved;
  breakpointNote.textContent = `${mobile}以下をMobile、${tablet}以下をTabletとして構造を切り替えます。`;
}

/* 策定状況テーブルと未決事項リスト */

const statusPresentation = {
  candidate: { label: '検証中', badge: 'hsg-badge-primary' },
  selected: { label: '選定済', badge: 'hsg-badge-secondary' },
  approved: { label: '利用可', badge: 'hsg-badge-secondary' },
  undecided: { label: '未策定', badge: 'hsg-badge-neutral' },
  deprecated: { label: '非推奨', badge: 'hsg-badge-orange' },
};

const statusRows = [
  ...data.sources.map((source) => ({ label: source.label, status: source.status, pending: source.pending })),
  ...data.assets.map((asset) => ({ label: `${asset.label}（${asset.kind}）`, status: asset.status, pending: asset.pending })),
];

const statusTable = document.querySelector('[data-render="status-table"]');
if (statusTable) {
  const head = el('div', 'status-row status-head');
  head.setAttribute('role', 'row');
  ['領域', '状態', '未決事項'].forEach((text) => head.append(el('span', '', text)));
  statusTable.append(head);
  statusRows.forEach((row) => {
    const presentation = statusPresentation[row.status] ?? { label: row.status, badge: 'hsg-badge-neutral' };
    const node = el('div', 'status-row');
    node.setAttribute('role', 'row');
    const badgeCell = el('span');
    badgeCell.append(el('b', `hsg-badge ${presentation.badge}`, presentation.label));
    node.append(
      el('strong', '', row.label),
      badgeCell,
      el('span', '', row.pending.length ? row.pending.map((entry) => entry.topic).join('、') : 'なし'),
    );
    statusTable.append(node);
  });
}

const pendingList = document.querySelector('[data-render="pending-list"]');
if (pendingList) {
  statusRows.filter((row) => row.pending.length).forEach((row) => {
    row.pending.forEach((entry) => {
      const article = el('article', 'pending-item');
      article.append(
        el('h4', '', `${row.label}｜${entry.topic}`),
        el('p', '', `確定の条件：${entry.until}`),
        el('p', '', `それまでの運用：${entry.interim}`),
      );
      pendingList.append(article);
    });
  });
}
