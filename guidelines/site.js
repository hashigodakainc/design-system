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
