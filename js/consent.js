/* Bandeau de consentement cookies — RGPD / CNIL.
   GA4 est en Consent Mode v2 : analytics_storage = "denied" par défaut.
   Ce script affiche le choix Accepter / Refuser et met à jour le consentement.
   Auto-injecté (styles + HTML), aucune dépendance. */
(function () {
  'use strict';
  var KEY = 'sr-consent'; // 'granted' | 'denied'

  function gtag() { if (window.gtag) window.gtag.apply(null, arguments); }

  function apply(state) {
    try { localStorage.setItem(KEY, state); } catch (e) {}
    gtag('consent', 'update', {
      analytics_storage: state === 'granted' ? 'granted' : 'denied'
    });
  }

  // Choix déjà fait → on ne réaffiche pas le bandeau.
  var prior;
  try { prior = localStorage.getItem(KEY); } catch (e) {}
  if (prior === 'granted' || prior === 'denied') return;

  // --- styles (indépendants de la CSS de la page) ---
  var css = document.createElement('style');
  css.textContent =
    '#sr-cookie{position:fixed;left:16px;right:16px;bottom:16px;z-index:99999;max-width:560px;margin:0 auto;' +
    'background:#18140E;color:#FAF6EF;border:1px solid rgba(250,246,239,.14);border-radius:16px;' +
    'padding:20px 22px;box-shadow:0 18px 50px rgba(0,0,0,.35);font-family:"DM Sans",system-ui,sans-serif;' +
    'cursor:auto;opacity:0;transform:translateY(14px);transition:opacity .4s ease,transform .4s ease}' +
    '#sr-cookie a{cursor:pointer}' +
    '#sr-cookie.in{opacity:1;transform:translateY(0)}' +
    '#sr-cookie p{margin:0 0 14px;font-size:14px;line-height:1.55;color:rgba(250,246,239,.82)}' +
    '#sr-cookie a{color:#FF6633;text-decoration:underline}' +
    '#sr-cookie .sr-row{display:flex;gap:10px;flex-wrap:wrap}' +
    '#sr-cookie button{flex:1 1 140px;cursor:pointer;border:0;border-radius:999px;padding:12px 18px;' +
    'font-family:inherit;font-size:14px;font-weight:600;transition:transform .15s ease}' +
    '#sr-cookie button:hover{transform:translateY(-1px)}' +
    '#sr-cookie .sr-accept{background:#E84C1A;color:#fff}' +
    '#sr-cookie .sr-refuse{background:transparent;color:#FAF6EF;border:1px solid rgba(250,246,239,.3)}' +
    '@media(prefers-reduced-motion:reduce){#sr-cookie{transition:none}}' +
    '@media(max-width:480px){#sr-cookie{left:10px;right:10px;bottom:10px;padding:18px}}';
  document.head.appendChild(css);

  // Lien mentions légales : '../' si la page est dans un sous-dossier (ex. /<client>/).
  var depth = location.pathname.replace(/\/[^/]*$/, '/').split('/').length - 2;
  var legal = (depth > 0 ? '../'.repeat(depth) : '') + 'mentions-legales.html';

  var bar = document.createElement('div');
  bar.id = 'sr-cookie';
  bar.setAttribute('role', 'dialog');
  bar.setAttribute('aria-label', 'Consentement aux cookies');
  bar.innerHTML =
    '<p>Ce site utilise des cookies de mesure d’audience (Google Analytics) pour comprendre sa ' +
    'fréquentation. Aucun cookie n’est déposé sans votre accord. ' +
    '<a href="' + legal + '">En savoir plus</a>.</p>' +
    '<div class="sr-row">' +
    '<button class="sr-refuse" type="button">Refuser</button>' +
    '<button class="sr-accept" type="button">Accepter</button>' +
    '</div>';
  document.body.appendChild(bar);
  requestAnimationFrame(function () { bar.classList.add('in'); });

  function close(state) {
    apply(state);
    bar.classList.remove('in');
    setTimeout(function () { if (bar.parentNode) bar.parentNode.removeChild(bar); }, 350);
  }
  bar.querySelector('.sr-accept').addEventListener('click', function () { close('granted'); });
  bar.querySelector('.sr-refuse').addEventListener('click', function () { close('denied'); });
})();
