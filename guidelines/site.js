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

/* ---- 正本JSON（tokens/*.json・assets/manifest.json）を直接読み込んで描画 ---- */

const fetchJson = (path) => fetch(path).then((response) => {
  if (!response.ok) throw new Error(`${path}: ${response.status}`);
  return response.json();
});

const render = (colorSource, typographySource, layoutSource) => {
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };

  const allTokens = [...colorSource.tokens, ...typographySource.tokens, ...layoutSource.tokens];
  const tokenByName = new Map(allTokens.map((token) => [token.name, token]));
  const cssVar = (name) => `--hsg-${name.replaceAll('.', '-')}`;

  const resolveValue = (value) => {
    const reference = /^\{(.+)\}$/.exec(value);
    return reference ? resolveValue(tokenByName.get(reference[1]).value) : value;
  };

  const displayName = (name) => name.split('.').pop()
    .replace(/(^|-)([a-z])/g, (_, sep, ch) => (sep ? ' ' : '') + ch.toUpperCase());

  const luminance = (hex) => {
    const [r, g, b] = hex.slice(1).match(/../g).map((channel) => {
      const value = parseInt(channel, 16) / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const renderSwatch = (token, kind) => {
    const article = el('article', kind);
    const color = el(kind === 'swatch' ? 'div' : 'span', kind === 'swatch' ? 'swatch-color' : '');
    color.style.background = `var(${cssVar(token.name)})`;
    if (luminance(resolveValue(token.value)) > 0.8) color.classList.add('chip-pale');
    const body = el('div');
    body.append(
      el('p', '', displayName(token.name)),
      el('strong', '', resolveValue(token.value).toUpperCase()),
      el('small', '', token.description ?? ''),
    );
    article.append(color, body);
    return article;
  };

  const brandContainer = document.querySelector('[data-render="brand-swatches"]');
  const neutralContainer = document.querySelector('[data-render="neutral-swatches"]');
  const foundationContainer = document.querySelector('[data-render="foundation-swatches"]');
  const semanticContainer = document.querySelector('[data-render="semantic-swatches"]');
  if (brandContainer) {
    colorSource.tokens
      .filter((token) => token.name.startsWith('color.brand.'))
      .forEach((token) => brandContainer.append(renderSwatch(token, 'swatch')));
  }
  if (neutralContainer) {
    colorSource.tokens
      .filter((token) => token.layer === 'primitive' && token.name.startsWith('color.neutral.'))
      .forEach((token) => neutralContainer.append(renderSwatch(token, 'neutral')));
  }
  if (foundationContainer) {
    const foundationGroups = [
      {
        label: 'Background',
        prefixes: ['color.background.'],
      },
      {
        label: 'Text',
        prefixes: ['color.text.'],
      },
      {
        label: 'Border & Focus',
        prefixes: ['color.border.', 'color.focus.'],
      },
    ];
    foundationGroups.forEach(({ label, prefixes }) => {
      const group = el('section', 'foundation-group');
      const heading = el('div', 'foundation-group-heading');
      heading.append(el('h4', 'hsg-type-heading-4', label));
      const grid = el('div', 'neutral-grid');
      grid.setAttribute('aria-label', `${label} semantic colors`);
      colorSource.tokens
        .filter((token) => token.layer === 'semantic' && prefixes.some((prefix) => token.name.startsWith(prefix)))
        .forEach((token) => grid.append(renderSwatch(token, 'neutral')));
      group.append(heading, grid);
      foundationContainer.append(group);
    });
  }
  if (semanticContainer) {
    const statusGroups = {
      success: 'Success',
      warning: 'Warning',
      error: 'Error',
      info: 'Info',
    };
    Object.entries(statusGroups).forEach(([status, label]) => {
      const group = el('section', 'foundation-group');
      const heading = el('div', 'foundation-group-heading');
      heading.append(el('h4', 'hsg-type-heading-4', label));
      const grid = el('div', 'neutral-grid');
      grid.setAttribute('aria-label', `${label} status colors`);
      colorSource.tokens
        .filter((token) => token.layer === 'semantic' && token.name.startsWith(`color.status.${status}.`))
        .forEach((token) => grid.append(renderSwatch(token, 'neutral')));
      group.append(heading, grid);
      semanticContainer.append(group);
    });
  }

  const stripUnit = (value) => value.replace(/px$/, '');
  const roleByClass = new Map(typographySource.roles.map((role) => [`.hsg-type-${role.name}`, role]));
  document.querySelectorAll('.type-role').forEach((article) => {
    const code = article.querySelector('.type-role-name code')?.textContent;
    const dl = article.querySelector('[data-render="role-specs"]');
    const role = roleByClass.get(code);
    if (!dl || !role) return;
    const fontSize = resolveValue(role.fontSize);
    const letterSpacing = resolveValue(role.letterSpacing);
    const specs = [
      ['Size', role.mobileFontSize ? `${stripUnit(fontSize)} / ${stripUnit(resolveValue(role.mobileFontSize))}` : stripUnit(fontSize)],
      ['Line', resolveValue(role.lineHeight)],
      letterSpacing !== '0'
        ? ['Tracking', letterSpacing.replace('-', '−')]
        : ['Weight', resolveValue(role.fontWeight)],
    ];
    specs.forEach(([term, value]) => {
      const wrap = el('div');
      wrap.append(el('dt', '', term), el('dd', '', value));
      dl.append(wrap);
    });
  });

  const typographyPending = document.querySelector('[data-render="typography-pending"]');
  if (typographyPending) {
    const pending = typographySource.pending ?? [];
    if (pending.length) {
      typographyPending.textContent = pending.map((entry) => entry.interim).join(' ');
    } else {
      typographyPending.remove();
    }
  }

  const spaceScale = document.querySelector('[data-render="space-scale"]');
  if (spaceScale) {
    layoutSource.tokens
      .filter((token) => /^space\.\d+$/.test(token.name) && resolveValue(token.value) !== '0px')
      .sort((a, b) => parseInt(resolveValue(a.value), 10) - parseInt(resolveValue(b.value), 10))
      .forEach((token) => {
        const item = el('div');
        const bar = el('span');
        bar.style.setProperty('--space-size', resolveValue(token.value));
        item.append(bar, el('strong', '', stripUnit(resolveValue(token.value))));
        spaceScale.append(item);
      });
  }

  document.querySelectorAll('[data-layout-values]').forEach((node) => {
    const values = node.dataset.layoutValues.split(',')
      .map((name) => {
        const token = tokenByName.get(name.trim());
        return token ? resolveValue(token.value) : '?';
      });
    const allPx = values.every((value) => /px$/.test(value));
    const joined = allPx ? `${values.map(stripUnit).join(' / ')}px` : values.join(' / ');
    node.textContent = joined + (node.dataset.layoutSuffix ?? '');
  });

  const breakpointNote = document.querySelector('[data-render="breakpoint-note"]');
  if (breakpointNote) {
    const mobile = resolveValue(tokenByName.get('layout.breakpoint.mobile').value);
    const tablet = resolveValue(tokenByName.get('layout.breakpoint.tablet').value);
    breakpointNote.textContent = `${mobile}以下をMobile、${tablet}以下をTabletとして構造を切り替えます。`;
  }

};

Promise.all([
  fetchJson('../tokens/colors.json'),
  fetchJson('../tokens/typography.json'),
  fetchJson('../tokens/layout.json'),
]).then((sources) => render(...sources)).catch((error) => {
  console.error('デザイントークンの読み込みに失敗しました。HTTPサーバー経由（リポジトリルート配信）で表示してください。', error);
});
