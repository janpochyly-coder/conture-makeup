/* Conture – generatívne ilustrácie techník (obočie, očné linky, pery).
   Kreslí sa do <svg data-art="brow-hair|brow-powder|brow-combo|eye-fine|eye-deco|eye-lower|lips" ...>
   Farby: data-ink, data-ink2, data-bg. Seed: data-seed. Bez závislostí. */
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  function rng(seed) { var a = seed >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function el(n, at, parent) { var e = document.createElementNS(NS, n); for (var k in at) e.setAttribute(k, at[k]); if (parent) parent.appendChild(e); return e; }
  function f(n) { return Math.round(n * 100) / 100; }
  var lerp = function (a, b, t) { return a + (b - a) * t; };

  var css = '.art-svg{overflow:visible}.art-svg .dr{stroke-dasharray:1;stroke-dashoffset:1}.art-svg.go .dr{animation:artdraw 1.1s cubic-bezier(.3,.7,.2,1) forwards;animation-delay:var(--d,0s)}.art-svg .fd{opacity:0}.art-svg.go .fd{animation:artfade 1.4s ease forwards;animation-delay:var(--d,0s)}@keyframes artdraw{to{stroke-dashoffset:0}}@keyframes artfade{to{opacity:1}}@media (prefers-reduced-motion:reduce){.art-svg .dr{stroke-dashoffset:0}.art-svg .fd{opacity:1}.art-svg.go .dr,.art-svg.go .fd{animation:none}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* --- obočie: stredová krivka + hrúbka --- */
  var BW = 400, BH = 140;
  function browY(t) { var u = t < 0.58 ? (t - 0.58) / 0.58 : (t - 0.58) / 0.42; return 96 - 54 * (1 - u * u) + (t > 0.58 ? 22 * Math.pow((t - 0.58) / 0.42, 2.2) : 0) - (t < 0.1 ? 0 : 0); }
  function browTh(t) { return t < 0.38 ? 15 + 12 * (t / 0.38) : 27 * (1 - 0.93 * Math.pow((t - 0.38) / 0.62, 1.5)); }
  function browPt(t) { return { x: 18 + t * (BW - 36), y: browY(t), th: browTh(t) }; }
  function tangent(t) { var a = browPt(Math.max(0, t - 0.01)), b = browPt(Math.min(1, t + 0.01)); return Math.atan2(b.y - a.y, b.x - a.x); }

  function drawHair(g, o, from, to, dens) {
    var r = rng(o.seed), N = Math.round(dens);
    for (var i = 0; i < N; i++) {
      var t = lerp(from, to, i / N) + (r() - 0.5) * 0.004, p = browPt(t);
      for (var layer = 0; layer < 3; layer++) {
        var fr = (layer + r() * 0.8) / 3;                       // 0 = spodok, 1 = vrch
        var sx = p.x + (r() - 0.5) * 2.2, sy = p.y + p.th / 2 - fr * p.th * 0.85 + (r() - 0.5) * 1.5;
        var tg = tangent(t), up = -Math.PI * (0.40 + 0.06 * r());   // hlava: takmer zvisle
        var ang = lerp(up, tg - 0.1, Math.pow(Math.min(1, t / 0.7), 0.9)) + (r() - 0.5) * 0.12;
        var L = (p.th * 0.55 + 4) * (0.8 + r() * 0.5) * (0.55 + 0.45 * (1 - fr * 0.3));
        var ex = sx + Math.cos(ang) * L, ey = sy + Math.sin(ang) * L;
        var cx = (sx + ex) / 2 - Math.sin(ang) * L * 0.12, cy = (sy + ey) / 2 + Math.cos(ang) * L * 0.12;
        var path = el('path', { d: 'M' + f(sx) + ' ' + f(sy) + ' Q' + f(cx) + ' ' + f(cy) + ' ' + f(ex) + ' ' + f(ey), pathLength: 1, class: 'dr', fill: 'none', stroke: o.ink, 'stroke-width': f(0.95 + r() * 0.6), 'stroke-linecap': 'round', opacity: f(0.6 + r() * 0.4), style: '--d:' + f(t * 0.9 + r() * 0.2) + 's' }, g);
      }
    }
  }
  function drawPowder(g, o, from, to, dens, defs, id) {
    var r = rng(o.seed + 7);
    // mäkký základ
    var top = [], bot = [];
    for (var i = 0; i <= 40; i++) { var t = lerp(from, to, i / 40), p = browPt(t); top.push(f(p.x) + ' ' + f(p.y - p.th / 2)); bot.unshift(f(p.x) + ' ' + f(p.y + p.th / 2)); }
    var fl = el('filter', { id: id + 'b', x: '-10%', y: '-30%', width: '120%', height: '160%' }, defs); el('feGaussianBlur', { stdDeviation: 2.4 }, fl);
    var lg = el('linearGradient', { id: id + 'g', x1: 0, x2: 1, y1: 0, y2: 0 }, defs);
    el('stop', { offset: 0, 'stop-color': o.ink, 'stop-opacity': from > 0.2 ? 0.0 : 0.28 }, lg); el('stop', { offset: 0.45, 'stop-color': o.ink, 'stop-opacity': 0.5 }, lg); el('stop', { offset: 1, 'stop-color': o.ink, 'stop-opacity': 0.34 }, lg);
    el('path', { d: 'M' + top.join(' L') + ' L' + bot.join(' L') + ' Z', fill: 'url(#' + id + 'g)', filter: 'url(#' + id + 'b)', class: 'fd', style: '--d:.1s' }, g);
    // zrnitosť (stipple)
    var gg = el('g', { class: 'fd', style: '--d:.4s' }, g);
    for (var k = 0; k < dens; k++) {
      var t = lerp(from, to, Math.pow(r(), 0.92)), p = browPt(t), v = (r() + r() + r() - 1.5) / 1.5;      // gauss-like
      var x = p.x + (r() - 0.5) * 4, y = p.y + v * p.th * 0.5;
      var edge = Math.abs(v); if (r() < edge * 0.55) continue;
      var headFade = from > 0.2 ? Math.min(1, (t - from) / 0.18) : Math.min(1, 0.35 + t * 3);
      if (r() > headFade) continue;
      el('circle', { cx: f(x), cy: f(y), r: f(0.35 + r() * 0.7), fill: o.ink, opacity: f(0.25 + r() * 0.5) }, gg);
    }
  }

  /* --- oko --- */
  var EW = 300, EH = 150;
  function qb(p0, p1, p2, t) { var a = (1 - t) * (1 - t), b = 2 * (1 - t) * t, c = t * t; return { x: a * p0.x + b * p1.x + c * p2.x, y: a * p0.y + b * p1.y + c * p2.y }; }
  var E_IN = { x: 22, y: 92 }, E_OUT = { x: 278, y: 84 }, E_UC = { x: 130, y: 18 }, E_LC = { x: 150, y: 132 };
  function ribbon(pts, wFn, side) { // pás okolo krivky
    var up = [], dn = [];
    for (var i = 0; i < pts.length; i++) {
      var a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, w = wFn(i / (pts.length - 1));
      up.push((pts[i].x + nx * w * side[0]).toFixed(1) + ' ' + (pts[i].y + ny * w * side[0]).toFixed(1));
      dn.unshift((pts[i].x + nx * w * side[1]).toFixed(1) + ' ' + (pts[i].y + ny * w * side[1]).toFixed(1));
    }
    return 'M' + up.join(' L') + ' L' + dn.join(' L') + ' Z';
  }
  function drawEye(svg, type, o) {
    var defs = el('defs', {}, svg), g = el('g', {}, svg), id = 'e' + o.seed;
    svg.setAttribute('viewBox', '0 0 ' + EW + ' ' + EH);
    var eyePath = 'M' + E_IN.x + ' ' + E_IN.y + ' Q' + E_UC.x + ' ' + E_UC.y + ' ' + E_OUT.x + ' ' + E_OUT.y + ' Q' + E_LC.x + ' ' + E_LC.y + ' ' + E_IN.x + ' ' + E_IN.y + 'Z';
    var cp = el('clipPath', { id: id + 'c' }, defs); el('path', { d: eyePath }, cp);
    // záhyb viečka
    el('path', { d: 'M12 74 Q130 -6 286 62', fill: 'none', stroke: o.ink2, 'stroke-width': 1.2, 'stroke-linecap': 'round', opacity: .5 }, g);
    // očná guľa
    el('path', { d: eyePath, fill: o.eyeWhite || '#fffdfa', stroke: 'none' }, g);
    var cg = el('g', { 'clip-path': 'url(#' + id + 'c)' }, g);
    var rg = el('radialGradient', { id: id + 'i', cx: .5, cy: .5, r: .55 }, defs);
    el('stop', { offset: 0, 'stop-color': o.iris || '#8a6a4b' }, rg); el('stop', { offset: .75, 'stop-color': o.iris2 || '#4a3526' }, rg); el('stop', { offset: 1, 'stop-color': '#2a1d14' }, rg);
    el('circle', { cx: 152, cy: 78, r: 54, fill: 'url(#' + id + 'i)' }, cg);
    el('circle', { cx: 152, cy: 78, r: 20, fill: '#150e0a' }, cg);
    el('circle', { cx: 168, cy: 62, r: 7, fill: '#fff', opacity: .85 }, cg);
    var sh = el('linearGradient', { id: id + 's', x1: 0, y1: 0, x2: 0, y2: 1 }, defs); el('stop', { offset: 0, 'stop-color': '#000', 'stop-opacity': .22 }, sh); el('stop', { offset: .5, 'stop-color': '#000', 'stop-opacity': 0 }, sh);
    el('path', { d: eyePath, fill: 'url(#' + id + 's)' }, cg);
    // linka
    var up = [], lo = [], N = 60, i, t;
    for (i = 0; i <= N; i++) { t = i / N; up.push(qb(E_IN, E_UC, E_OUT, t)); lo.push(qb(E_IN, E_LC, E_OUT, t)); }
    if (type === 'fine') {
      el('path', { d: ribbon(up, function (t) { return 2.6 + 3.4 * Math.sin(Math.PI * Math.pow(t, .8)); }, [0, 1]), fill: o.ink, class: 'fd' }, g);
    } else if (type === 'deco') {
      el('path', { d: ribbon(up, function (t) { return 3.4 + 8 * Math.sin(Math.PI * Math.pow(t, .75)); }, [0, 1]), fill: o.ink, class: 'fd' }, g);
      // krídlo
      el('path', { d: 'M' + E_OUT.x + ' ' + (E_OUT.y - 2) + ' C 288 76 298 62 306 48 C 296 66 288 74 266 80 Z', fill: o.ink, class: 'fd', style: '--d:.5s' }, g);
      el('path', { d: ribbon(lo.slice(40), function (t) { return 1.4 * (1 - t); }, [0, -1]), fill: o.ink, opacity: .35 }, g);
    } else if (type === 'lower') {
      el('path', { d: ribbon(up, function (t) { return .8 + .6 * Math.sin(Math.PI * t); }, [0, 1]), fill: o.ink, opacity: .3 }, g);
      el('path', { d: ribbon(lo, function (t) { return 2 + 4.2 * Math.sin(Math.PI * Math.pow(t, .9)); }, [0, -1]), fill: o.ink, class: 'fd' }, g);
    }
    // jemné riasy (sugescia)
    var r = rng(o.seed + 3);
    for (i = 0; i < (type === "lower" ? 18 : 34); i++) {
      t = .18 + .8 * (i / (type === "lower" ? 17 : 33)); var p = qb(E_IN, E_UC, E_OUT, t), q = qb(E_IN, E_UC, E_OUT, Math.min(1, t + .02)), a = Math.atan2(q.y - p.y, q.x - p.x) - Math.PI / 2 - (t - .3) * .9, l = 10 + r() * 6 + Math.sin(Math.PI * t) * 12;
      el("path", { d: "M" + f(p.x) + " " + f(p.y) + " Q" + f(p.x + Math.cos(a) * l * .55 - 2) + " " + f(p.y + Math.sin(a) * l * .7) + " " + f(p.x + Math.cos(a + .55) * l) + " " + f(p.y + Math.sin(a + .55) * l), fill: "none", stroke: o.ink, "stroke-width": f(1 + r() * .7), "stroke-linecap": "round", opacity: type === "fine" || type === "deco" ? .85 : .32, class: "fd", style: "--d:" + f(.3 + t * .5) + "s" }, g);
    }
    el('path', { d: eyePath, fill: 'none', stroke: o.ink2, 'stroke-width': .9, opacity: .5 }, g);
  }

  /* --- pery --- */
  function drawLips(svg, o) {
    svg.setAttribute('viewBox', '0 0 120 100');
    var defs = el('defs', {}, svg), id = 'l' + o.seed, g = el('g', {}, svg);
    var gu = el('linearGradient', { id: id + 'u', x1: 0, y1: 0, x2: 0, y2: 1 }, defs); el('stop', { offset: 0, 'stop-color': o.ink }, gu); el('stop', { offset: 1, 'stop-color': o.ink2 }, gu);
    var gl = el('linearGradient', { id: id + 'l', x1: 0, y1: 0, x2: 0, y2: 1 }, defs); el('stop', { offset: 0, 'stop-color': o.ink2 }, gl); el('stop', { offset: 1, 'stop-color': o.ink }, gl);
    var up = 'M2 52 C18 44 30 14 46 17 C54 18 56 26 60 26 C64 26 66 18 74 17 C90 14 102 44 118 52 C95 56 80 54 60 56 C40 54 25 56 2 52Z';
    var lo = 'M2 52 C25 56 40 54 60 56 C80 54 95 56 118 52 C104 82 84 92 60 92 C36 92 16 82 2 52Z';
    el('path', { d: lo, fill: 'url(#' + id + 'l)', class: 'fd' }, g);
    el('path', { d: up, fill: 'url(#' + id + 'u)', class: 'fd', style: '--d:.2s' }, g);
    el('path', { d: 'M2 52 C25 56 40 54 60 56 C80 54 95 56 118 52', fill: 'none', stroke: o.ink3 || '#3b1c20', 'stroke-width': 1.4, 'stroke-linecap': 'round', opacity: .8 }, g);
    el('path', { d: 'M38 74 C48 82 72 82 82 74', fill: 'none', stroke: '#fff', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: .22 }, g);
    el('path', { d: 'M44 24 C50 22 54 28 58 30', fill: 'none', stroke: '#fff', 'stroke-width': 2, 'stroke-linecap': 'round', opacity: .18 }, g);
    // jemná textúra
    var r = rng(o.seed + 11);
    for (var i = 0; i < 90; i++) { var x = 12 + r() * 96, y = 28 + r() * 62; el('circle', { cx: f(x), cy: f(y), r: .5, fill: '#fff', opacity: .12 }, g); }
  }

  function build(svg) {
    if (svg.__done) return; svg.__done = 1;
    var type = svg.getAttribute('data-art'), seed = +(svg.getAttribute('data-seed') || 7);
    var o = { ink: svg.getAttribute('data-ink') || '#3a2a22', ink2: svg.getAttribute('data-ink2') || '#6b5547', ink3: svg.getAttribute('data-ink3'), seed: seed, iris: svg.getAttribute('data-iris'), iris2: svg.getAttribute('data-iris2'), eyeWhite: svg.getAttribute('data-white') };
    svg.classList.add('art-svg'); svg.setAttribute('role', 'img');
    if (type.indexOf('brow') === 0) {
      svg.setAttribute('viewBox', '0 0 ' + BW + ' ' + BH);
      var defs = el('defs', {}, svg), g = el('g', {}, svg), id = 'b' + seed + Math.floor(Math.random() * 1e4);
      if (type === 'brow-hair') drawHair(g, o, 0, 1, 150);
      else if (type === 'brow-powder') drawPowder(g, o, 0, 1, 1700, defs, id);
      else { drawPowder(g, o, 0.34, 1, 1000, defs, id); drawHair(g, o, 0, 0.62, 95); }
    } else if (type.indexOf('eye-') === 0) {
      drawEye(svg, type.split('-')[1], o);
    } else if (type === 'lips') { drawLips(svg, o); }
  }
  function init() {
    var all = document.querySelectorAll('svg[data-art]'); for (var i = 0; i < all.length; i++) build(all[i]);
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('go'); io.unobserve(e.target); } }); }, { threshold: .25 });
      for (i = 0; i < all.length; i++) io.observe(all[i]);
    } else for (i = 0; i < all.length; i++) all[i].classList.add('go');
  }
  window.ConturArt = { init: init, build: build };
  if (document.readyState !== 'loading') init(); else document.addEventListener('DOMContentLoaded', init);
})();
