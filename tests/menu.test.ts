import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initMenu } from '../src/scripts/menu';

function setup() {
  document.body.innerHTML = `
    <header class="site-header">
      <nav class="site-header__nav" id="site-menu">
        <a class="site-header__link" href="#colmenas">Colmenas</a>
      </nav>
      <button class="site-header__toggle" aria-controls="site-menu" data-label-open="Menú" data-label-close="Cerrar menú"></button>
    </header>
    <main><p id="outside">x</p></main>`;
  initMenu();
  return {
    header: document.querySelector<HTMLElement>('.site-header')!,
    toggle: document.querySelector<HTMLButtonElement>('.site-header__toggle')!,
    link: document.querySelector<HTMLAnchorElement>('.site-header__link')!,
  };
}

describe('mobile menu', () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn() });
  });

  it('starts closed with an accessible label', () => {
    const { header, toggle } = setup();
    expect(header.dataset.menuOpen).toBe('false');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.getAttribute('aria-label')).toBe('Menú');
  });

  it('opens on toggle, focuses the first link and relabels the button', () => {
    const { header, toggle, link } = setup();
    toggle.click();
    expect(header.dataset.menuOpen).toBe('true');
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(toggle.getAttribute('aria-label')).toBe('Cerrar menú');
    expect(document.activeElement).toBe(link);
  });

  it('closes when a section is chosen, on Escape (restoring focus) and on outside clicks', () => {
    const { header, toggle, link } = setup();
    toggle.click();
    link.click();
    expect(header.dataset.menuOpen).toBe('false');

    toggle.click();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(header.dataset.menuOpen).toBe('false');
    expect(document.activeElement).toBe(toggle);

    toggle.click();
    document.getElementById('outside')!.click();
    expect(header.dataset.menuOpen).toBe('false');
  });
});
