// Progressive scroll reveal for [data-reveal] nodes. Content stays visible
// without JS (the .js class gates the hidden state) and under reduced motion.
export function initReveal(root: Document = document): void {
  const nodes = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduce || !('IntersectionObserver' in window)) {
    nodes.forEach((node) => node.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );

  nodes.forEach((node) => observer.observe(node));
}
