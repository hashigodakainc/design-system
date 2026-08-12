const baseUrl = new URL(process.argv[2] ?? process.env.SITE_BASE_URL ?? 'http://127.0.0.1:8787');
const failures = [];

const checks = [
  ['/', 200, 'Hashigodaka Design System'],
  ['/site.css', 200, '.sidebar'],
  ['/site.js', 200, 'fetchJson'],
  ['/tokens/colors.json', 200, 'color.brand.primary'],
  ['/tokens/components.json', 200, 'button.primary.background'],
  ['/assets/manifest.json', 200, 'brand-motif'],
  ['/assets/icons/favicon.svg', 200, '<svg'],
  ['/assets/social/design-system-og.png', 200, null],
  ['/assets/wordmarks/wordmark.svg', 200, '<svg'],
  ['/docs/guidelines.md', 200, '# Hashigodaka'],
  ['/AGENTS.md', 404, null],
  ['/mcp/wrangler.jsonc', 404, null],
  ['/site/package.json', 404, null],
  ['/.git/config', 404, null],
  [`/__not-found-${Date.now()}`, 404, null],
];

for (const [pathname, expectedStatus, expectedBody] of checks) {
  const url = new URL(pathname, baseUrl);
  try {
    const response = await fetch(url, { redirect: 'manual' });
    const body = await response.text();
    if (response.status !== expectedStatus) {
      failures.push(`${pathname}: expected ${expectedStatus}, received ${response.status}`);
    }
    if (expectedBody && !body.includes(expectedBody)) {
      failures.push(`${pathname}: response did not include ${JSON.stringify(expectedBody)}`);
    }
    if (pathname === '/') {
      if (response.headers.get('x-content-type-options') !== 'nosniff') failures.push('/: missing X-Content-Type-Options');
      if (!response.headers.get('content-security-policy')?.includes("frame-ancestors 'none'")) failures.push('/: missing expected CSP');
    }
  } catch (error) {
    failures.push(`${pathname}: ${error.message}`);
  }
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Smoke checks passed against ${baseUrl.origin}.`);
}
