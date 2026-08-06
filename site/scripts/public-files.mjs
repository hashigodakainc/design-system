export const publicFiles = [
  ['guidelines/index.html', 'index.html'],
  ['guidelines/site.css', 'site.css'],
  ['guidelines/site.js', 'site.js'],
  ['styles/tokens.css', 'styles/tokens.css'],
  ['styles/typography.css', 'styles/typography.css'],
  ['styles/components.css', 'styles/components.css'],
  ['tokens/colors.json', 'tokens/colors.json'],
  ['tokens/components.json', 'tokens/components.json'],
  ['tokens/typography.json', 'tokens/typography.json'],
  ['tokens/layout.json', 'tokens/layout.json'],
  ['assets/manifest.json', 'assets/manifest.json'],
  ['assets/fonts/sora.ttf', 'assets/fonts/sora.ttf'],
  ['assets/fonts/sora-OFL.txt', 'assets/fonts/sora-OFL.txt'],
  ['assets/fonts/line-seed-jp-regular.ttf', 'assets/fonts/line-seed-jp-regular.ttf'],
  ['assets/fonts/line-seed-jp-bold.ttf', 'assets/fonts/line-seed-jp-bold.ttf'],
  ['assets/fonts/line-seed-jp-OFL.txt', 'assets/fonts/line-seed-jp-OFL.txt'],
  ['assets/motifs/brand-motif.svg', 'assets/motifs/brand-motif.svg'],
  ['assets/wordmarks/wordmark.svg', 'assets/wordmarks/wordmark.svg'],
  ['docs/guidelines.md', 'docs/guidelines.md'],
  ['site/_headers', '_headers'],
];

const rootRelativeReplacements = [
  ['../styles/', 'styles/'],
  ['../assets/', 'assets/'],
  ['../tokens/', 'tokens/'],
  ['../docs/', 'docs/'],
  ['./site.css', 'site.css'],
  ['./site.js', 'site.js'],
];

export const transformPublicFile = (source, contents) => {
  if (!['guidelines/index.html', 'guidelines/site.css', 'guidelines/site.js'].includes(source)) {
    return contents;
  }

  let transformed = contents.toString('utf8');
  for (const [before, after] of rootRelativeReplacements) {
    transformed = transformed.replaceAll(before, after);
  }
  return Buffer.from(transformed);
};
