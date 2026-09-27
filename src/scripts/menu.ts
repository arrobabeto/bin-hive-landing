// Mobile nav disclosure for the site header. Without JS the menu panel stays
// visible (the `.js` class gates the collapsed state in CSS).
const DESKTOP_QUERY = '(min-width: 64rem)';

export function initMenu(root: Document = document): void {
  const header = root.querySelector<HTMLElement>('.site-header');
  const toggle = header?.querySelector<HTMLButtonElement>('.site-header__toggle');
  const panel = header?.querySelector<HTMLElement>('.site-header__nav');
  if (!header || !toggle || !panel) return;

  const openLabel = toggle.dataset.labelOpen ?? '';
  const closeLabel = toggle.dataset.labelClose ?? openLabel;

  const setOpen = (open: boolean, { focusToggle = false } = {}) => {
    header.dataset.menuOpen = String(open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? closeLabel : openLabel);
    if (!open && focusToggle) toggle.focus();
  };

  setOpen(false);

  toggle.addEventListener('click', () => {
    const open = header.dataset.menuOpen !== 'true';
    setOpen(open);
    if (open) panel.querySelector<HTMLElement>('a')?.focus();
  });

  // Choosing a section closes the menu.
  panel.addEventListener('click', (event) => {
    if ((event.target as HTMLElement).closest('a')) setOpen(false);
  });

  root.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && header.dataset.menuOpen === 'true') setOpen(false, { focusToggle: true });
  });

  // Tapping outside the header closes it.
  root.addEventListener('click', (event) => {
    if (header.dataset.menuOpen === 'true' && !header.contains(event.target as Node)) setOpen(false);
  });

  // Growing to desktop resets the state.
  window.matchMedia(DESKTOP_QUERY).addEventListener('change', (event) => {
    if (event.matches) setOpen(false);
  });
}
