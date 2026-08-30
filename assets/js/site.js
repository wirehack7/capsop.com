// Progressive enhancement for the blog. No framework, loaded with `defer`.
// Replaces jQuery + SimpleLightbox + scrollUp.
(() => {
  'use strict';

  /* ---- Lightbox --------------------------------------------------------- */

  const content = document.querySelector('.content');
  if (content) {
    // Wrap standalone post images in a link to the full-size file (also the
    // no-JS fallback).
    for (const img of content.querySelectorAll('p > img')) {
      if (img.classList.contains('emoji') || img.closest('a')) continue;
      const link = document.createElement('a');
      link.href = img.getAttribute('src');
      link.className = 'lightbox';
      img.replaceWith(link);
      link.append(img);
    }
  }

  const shots = [...document.querySelectorAll('a.lightbox')];
  if (shots.length) {
    const modal = document.createElement('dialog');
    modal.className = 'lb';
    modal.innerHTML =
      '<button class="lb__nav lb__prev" type="button" aria-label="Previous image">‹</button>' +
      '<img class="lb__img" alt="">' +
      '<button class="lb__nav lb__next" type="button" aria-label="Next image">›</button>' +
      '<button class="lb__close" type="button" aria-label="Close">×</button>';
    document.body.append(modal);

    const pic = modal.querySelector('.lb__img');
    let index = 0;

    const show = (n) => {
      index = (n + shots.length) % shots.length;
      pic.src = shots[index].href;
      pic.alt = shots[index].querySelector('img')?.alt || '';
      for (const nav of modal.querySelectorAll('.lb__nav')) nav.hidden = shots.length < 2;
    };

    shots.forEach((link, n) => link.addEventListener('click', (e) => {
      e.preventDefault();
      show(n);
      modal.showModal();
    }));

    modal.querySelector('.lb__close').addEventListener('click', () => modal.close());
    modal.querySelector('.lb__prev').addEventListener('click', (e) => { e.stopPropagation(); show(index - 1); });
    modal.querySelector('.lb__next').addEventListener('click', (e) => { e.stopPropagation(); show(index + 1); });
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); });
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    });
  }

  /* ---- Scroll to top --------------------------------------------------- */

  const toTop = document.createElement('button');
  toTop.type = 'button';
  toTop.className = 'to-top';
  toTop.setAttribute('aria-label', 'Scroll to top');
  toTop.textContent = '↑';
  toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
  document.body.append(toTop);

  const sync = () => toTop.classList.toggle('is-visible', window.scrollY > 400);
  addEventListener('scroll', sync, { passive: true });
  sync();
})();
