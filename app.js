import { I18N } from './i18n.js';

/* ---------------- constants ---------------- */
const LANGS = ['tw','cn','zh','en','jp','kr','th','vi'];
const LANG_NAME = {tw:'繁體中文',cn:'简体中文（国服译名）',zh:'简体中文（社区译名）',en:'English',jp:'日本語',kr:'한국어',th:'ไทย',vi:'Tiếng Việt'};
const LOCALE = {tw:'zh-TW',cn:'zh-CN',zh:'zh-CN',en:'en-US',jp:'ja-JP',kr:'ko-KR',th:'th-TH',vi:'vi-VN'};
const HTML_LANG = {tw:'zh-Hant',cn:'zh-Hans',zh:'zh-Hans',en:'en',jp:'ja',kr:'ko',th:'th',vi:'vi'};
const DEF_CUR = {tw:'twd',cn:'cny',zh:'cny',en:'usd',jp:'jpy',kr:'krw',th:'thb',vi:'vnd'};
const CATS = [['cur','💎'],['tic','🎫'],['skill','📘'],['oop','🏺'],['eleph','✨'],['gear','🛡️'],['grow','🧪'],['gift','💝'],['box','🎁'],['event','🎪'],['furn','🛋️']];
const CICON = Object.fromEntries(CATS);
const CORDER = Object.fromEntries(CATS.map((c, i) => [c[0], i]));
const GORDER = {
  cur: ['base','coin','ticket','point'], tic: ['pull','sel'], skill: ['bd','note','secret'],
  gear: ['bp','gbp','eq','stone','wpn'], grow: ['rep','mat'], gift: ['g4','g3','g2','g1'], box: ['pack','sel','rand'],
  furn: ['Prop','Table','Chair','Bed','Closet','HomeAppliance','WallDecoration','FloorDecoration','Floor','Wallpaper','Background','Trophy','FurnitureEtc'],
};
const GICON = {'cur.base':'💎','cur.coin':'🪙','cur.ticket':'🎟️','cur.point':'🔆','tic.pull':'🎫','tic.sel':'🌟','skill.bd':'💿','skill.note':'📘','skill.secret':'📕',
  'gear.bp':'📐','gear.gbp':'📐','gear.eq':'🛡️','gear.stone':'🔷','gear.wpn':'🔩','grow.rep':'📄','grow.mat':'🧪','box.pack':'🗓️','box.sel':'🎁','box.rand':'🎲',
  'furn.Prop':'🪴','furn.Table':'🍽️','furn.Chair':'🪑','furn.Bed':'🛏️','furn.Closet':'🗄️','furn.HomeAppliance':'📺','furn.WallDecoration':'🖼️','furn.FloorDecoration':'🧸',
  'furn.Floor':'🟫','furn.Wallpaper':'🧱','furn.Background':'🌄','furn.Trophy':'🏆','furn.FurnitureEtc':'📦'};
const icon = it => it.k === 'C3' ? '💎' : it.k === 'C5' ? '⚡' : it.k === 'C1' ? '💰' : GICON[it.c + '.' + it.g] || CICON[it.c] || '•';
const POPULAR = ['twd','usd','jpy','krw','cny','hkd','eur','gbp','thb','vnd','sgd','myr','php','idr','aud','cad','inr','brl','mxn'];
const FX_URL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json/+esm';
/* Taiwan iOS prices (NT$) — profiles and the comparison ladder */
const REF = [
  {id:'newbie', p:500, ap:0, twd:33},
  {id:'half', p:776, ap:0, twd:100},
  {id:'ap2w', p:176, ap:2100, twd:100},
  {id:'month', p:1592, ap:0, twd:230},
  {id:'apw', p:128, ap:1120, twd:65},
  {id:'direct', p:6600, ap:0, twd:2190},
];
const LITE = (100 + 230) / (776 + 1592), WHALE = 2190 / 6600;
const PROFS = ['f2p','lite','whale'];
const PICON = {f2p:'🐢', lite:'🌙', whale:'⚡', custom:'⚙️'};
const DAILY_P = [240, 465, 1065];
const QUICK = [['C3',100],['C5',120],['C1',100000],['I6998',1],['I6999',1]];
const THEMES = ['auto','blue','dark','pink','mint'];
const FS = {s:13.5, m:15, l:16.5, xl:18.5};
const TIERED = new Set(['oop','skill','grow']);
const COLS = ['pyro','ap','method','meta','demand'];
const PAGE = 12, MORE = 24;

/* ---------------- state ---------------- */
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const rd0 = k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
const load = (k, d, old) => { const v = rd0(k) ?? (old ? rd0(old) : null); return v && typeof v === 'object' ? Object.assign(d, v) : d; };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const guessLang = () => { const l = (navigator.language || '').toLowerCase(); if (l.startsWith('zh')) return /cn|sg|hans/.test(l) ? 'zh' : 'tw'; return {ja:'jp',ko:'kr',th:'th',vi:'vi',en:'en'}[l.slice(0, 2)] || 'tw'; };
const DEF = {prof:'lite', dailyAP:465, camp:1, apRate:0.25, cAmt:6600, cPrice:2190, cCur:'twd', region:1, mode:'acq'};
const st = load('ba4_state', {lang:guessLang(), cur:null, curManual:false, cur2:'', cat:'cur', sort:0, view:'list', viewManual:0, theme:'auto', fs:'m',
  cols:{pyro:1, ap:0, method:1, meta:1, demand:0}, open:{}, seenGuide:0, ...DEF});
const custom = load('ba4_custom', {}, 'ba2_custom');
const fav = load('ba4_fav', {}, 'ba2_fav');
const pack = load('ba4_pack', {items:[], price:'', cur:'', name:''}, 'ba2_pack');
const saved = load('ba4_saved', {list:[]}, 'ba2_saved');
let DATA = null, BYK = {}, FX = {date:'', usd:{}, live:false}, dn = null, sheetKind = '', curTarget = 'cur', VC = new Map();
const SHOWN = new Map();
const persist = () => { VC = new Map(); save('ba4_state', st); save('ba4_custom', custom); save('ba4_fav', fav); save('ba4_pack', pack); save('ba4_saved', saved); };

/* ---------------- i18n helpers ---------------- */
const Ln = () => I18N[st.lang] || I18N.en;
const li = () => LANGS.indexOf(st.lang);
const nm = it => (it && (it.n[li()] || it.n[3] || it.n[0])) || '';
function fill(s, v = {}) {
  s = String(s);
  if (DATA) v = {pm: nm(BYK.C18), eg: nm(BYK.I23), ...v};
  for (const a in v) s = s.split('{' + a + '}').join(v[a]);
  return s;
}
const t = (k, v) => fill(Ln()[k] ?? I18N.tw[k] ?? I18N.en[k] ?? k, v);
const tl = (obj, k) => (Ln()[obj] || {})[k] ?? (I18N.en[obj] || {})[k] ?? k;
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const mname = (o, c) => (DATA.meta[o][c] || [])[li()] || (DATA.meta[o][c] || [])[3] || c;
const schoolName = c => mname('schools', c);
const shopName = c => mname('shops', c);
const stageName = c => mname('stages', c);
const evRaw = id => { const e = DATA.meta.events[String(id)]; return (e && (e[li()] || e[3] || e[0])) || ''; };
const eventName = id => evRaw(id) || (+id > 10000 && evRaw(+id % 10000) ? t('rerun', {n: evRaw(+id % 10000)}) : t('evN', {id}));
const catLabel = c => tl('cats', c);
const profName = p => tl('prof', p);

/* ---------------- numbers ---------------- */
function fmtNum(x, sig = 3) {
  if (x == null || !isFinite(x)) return '—';
  const o = Math.abs(x) >= 100 ? {maximumFractionDigits:0} : {maximumSignificantDigits:sig};
  return new Intl.NumberFormat(LOCALE[st.lang], o).format(x);
}
const fmtDays = d => d == null || !isFinite(d) ? '—' : d > 0 && d < 0.1 ? '<0.1' : fmtNum(d, 2);
const DOLLAR = {twd:'NT$', usd:'US$', hkd:'HK$', aud:'A$', cad:'C$', sgd:'S$', mxn:'MX$', nzd:'NZ$', brl:'R$', ars:'AR$', clp:'CL$', cop:'COL$'};
function fmtCur(x, code = st.cur, exact = false) {
  if (x == null || !isFinite(x)) return '—';
  const o = exact ? {minimumFractionDigits:0, maximumFractionDigits:2} : Math.abs(x) >= 1000 ? {maximumFractionDigits:0} : x === 0 ? {maximumFractionDigits:0} : {maximumSignificantDigits:3};
  try {
    return new Intl.NumberFormat(LOCALE[st.lang], {style:'currency', currency:code.toUpperCase(), ...o}).formatToParts(x)
      .map(p => p.type === 'currency' && p.value === '$' ? (code === 'usd' && st.lang === 'en' ? '$' : (DOLLAR[code] || code.toUpperCase() + ' ')) : p.value).join('');
  } catch (e) { return new Intl.NumberFormat(LOCALE[st.lang], o).format(x) + ' ' + code.toUpperCase(); }
}
function curName(c) {
  try { dn = dn || new Intl.DisplayNames([LOCALE[st.lang]], {type:'currency'}); const n = dn.of(c.toUpperCase()); return n && n.toUpperCase() !== c.toUpperCase() ? n : ''; }
  catch (e) { return ''; }
}
const rate = c => FX.usd[c];
/* NT$ per Pyroxene for a profile (f2p borrows the monthly-card rate whenever money is needed) */
function twdPP(prof = st.prof) {
  if (prof === 'whale') return WHALE;
  if (prof === 'custom') { const r = rate(st.cCur), tw = rate('twd'); return r && tw && st.cAmt > 0 ? st.cPrice / r * tw / st.cAmt : LITE; }
  return LITE;
}
const twdTo = (x, code = st.cur) => { const tw = rate('twd'), c = rate(code); return tw && c ? x / tw * c : 0; };
const cpp = (code = st.cur, prof = st.prof) => twdTo(twdPP(prof), code);
const unitOf = it => it.k === 'C1' ? 10000 : 1;
const fx2 = f => (Math.round(f * 100) / 100).toFixed(2);
const isF2P = () => st.prof === 'f2p';

/* ---------------- values ---------------- */
const rv = it => it.v !== undefined ? it.v : (it.vr ? (it.vr[st.region] || it.vr[1] || it.vr[0] || it.vr[2]) : null);
const rd = it => it.d !== undefined ? it.d : (it.dr ? it.dr[st.region] : null);
const ar = () => st.apRate > 0 ? st.apRate : 0.25;
function boxVal(it, depth) {
  const [type, cs] = it.bx; const vals = [];
  for (const [k, amt] of cs) { const c = BYK[k]; if (!c) continue; const v = val(c, depth + 1); if (!v) return null; vals.push([v.p * amt, k]); }
  if (!vals.length) return null;
  if (type === 'c') { const b = vals.reduce((a, x) => x[0] > a[0] ? x : a); return {p: b[0], m: 'choice', x: {b: b[1], n: vals.length}}; }
  return {p: vals.reduce((s, x) => s + x[0], 0) / vals.length, m: 'random', x: {n: vals.length}};
}
function baseVal(it, depth = 0) {
  if (it.bx && depth < 4) { const b = boxVal(it, depth); if (b) return {...b, a: b.p / ar(), f: 1, pyroOnly: false}; }
  const v = rv(it);
  if (!v) return null;
  const d = rd(it); const f = st.mode === 'dem' && d ? d[0] : 1;
  const p = (v[1] + v[0] * ar()) * f;
  return {p, a: p / ar(), m: v[2], x: v[3] || {}, f, pyroOnly: v[0] === 0};
}
function val(it, depth = 0) {
  const c = custom[it.k];
  if (c != null && isFinite(c)) return {p: +c, a: c / ar(), m: 'custom', x: {}, f: 1};
  if (VC.has(it.k)) return VC.get(it.k);
  const r = baseVal(it, depth); VC.set(it.k, r); return r;
}
/* money/AP display for a pyro amount under the current profile */
const money = (p, prof = st.prof, code = st.cur) => fmtCur(p * cpp(code, prof), code);
const apOf = p => p / ar();
const daysOf = p => apOf(p) / Math.max(1, st.dailyAP);
function mainPrice(p) { return isF2P() ? fmtNum(apOf(p)) + ' AP' : money(p); }

/* ---------------- eleph farming ---------------- */
const elephX = it => { if (it.c !== 'eleph' || it.g === 'eligma') return null; const v = rv(it); return v && v[3] && v[3].h !== undefined ? v[3] : null; };
const elRate = h => 1.2 * h * (st.camp || 1);

/* ---------------- theme / font ---------------- */
const mq = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
function applyLook() {
  const th = st.theme === 'auto' ? (mq && mq.matches ? 'dark' : 'blue') : st.theme;
  document.documentElement.dataset.theme = th;
  document.documentElement.style.fontSize = (FS[st.fs] || 15) + 'px';
  document.documentElement.lang = HTML_LANG[st.lang];
  document.title = t('title');
}
if (mq && mq.addEventListener) mq.addEventListener('change', () => st.theme === 'auto' && applyLook());
function toast(s) { const e = $('#toast'); e.textContent = s; e.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.remove('on'), 1400); }

/* ---------------- chrome ---------------- */
const page = () => { const h = (location.hash || '#list').slice(1); return ['list', 'pack', 'help'].includes(h) ? h : 'list'; };
function profSub(p) {
  if (p === 'f2p') return t('apPerDay', {ap: fmtNum(st.dailyAP)});
  return fmtCur(cpp(st.cur, p)) + '/💎';
}
function profSeg(cls = '') {
  const ps = st.prof === 'custom' ? [...PROFS, 'custom'] : PROFS;
  return `<div class="profseg${ps.length > 3 ? ' c4' : ''} ${cls}" role="radiogroup">${ps.map(p => `<button class="pf${st.prof === p ? ' on' : ''}" data-act="prof" data-v="${p}" role="radio" aria-checked="${st.prof === p}"><em>${PICON[p]}</em><b>${esc(profName(p))}</b><small>${esc(profSub(p))}</small></button>`).join('')}</div>`;
}
function profDesc() {
  if (st.prof === 'f2p') return t('profD_f2p', {ap: fmtNum(st.dailyAP), r: ar()});
  if (st.prof === 'whale') return t('profD_whale', {x: fmtCur(cpp())});
  if (st.prof === 'custom') return t('profD_custom', {amt: fmtNum(st.cAmt), price: fmtCur(st.cPrice, st.cCur, true), x: fmtCur(cpp())});
  return t('profD_lite', {x: fmtCur(cpp())});
}
function renderChrome() {
  applyLook();
  $('#appName').textContent = t('appName');
  $('#curBtn').innerHTML = `${esc(st.cur.toUpperCase())} <span class="car">▾</span>`;
  $$('[data-tab]').forEach(a => {
    const i = +a.dataset.tab; a.querySelector('span').textContent = Ln().tabs[i];
    if (i === 1) a.querySelector('i').textContent = pack.items.length || '';
  });
  const fx = (FX.live ? '🟢 ' : '🟠 ') + t(FX.live ? 'fxLive' : 'fxSnap', {d: FX.date || '—'});
  $('#hero').innerHTML = `${profSeg()}<p class="pdesc">${esc(profDesc())}</p>
<div class="hrow"><span class="pp">${esc(isF2P() ? t('apLine', {r: ar()}) : t('per', {x: fmtCur(cpp())}) + (c2on() ? ' ≈ ' + fmtCur(cpp(st.cur2), st.cur2) : ''))}</span>
<span class="pill fx">${esc(fx)}</span><button class="info" data-act="profinfo" aria-label="info">ⓘ</button></div>`;
}
const c2on = () => st.cur2 && st.cur2 !== st.cur && rate(st.cur2);

/* ---------------- list page ---------------- */
const inRegion = it => it.rel[st.region];
function favCount() { return DATA.items.filter(it => fav[it.k] && inRegion(it)).length; }
function renderFilters() {
  $('#q').placeholder = t('search');
  const cnt = {}; for (const it of DATA.items) if (inRegion(it)) cnt[it.c] = (cnt[it.c] || 0) + 1;
  const fc = favCount();
  if (st.cat === 'fav' && !fc) st.cat = 'cur';
  const ch = $('#chips'), sl = ch.scrollLeft;
  ch.innerHTML = (fc ? `<button class="chip${st.cat === 'fav' ? ' on' : ''}" data-act="cat" data-v="fav">⭐ ${esc(t('favCat'))}<i>${fc}</i></button>` : '') +
    CATS.map(([c, e]) => `<button class="chip${st.cat === c ? ' on' : ''}" data-act="cat" data-v="${c}">${e} ${esc(catLabel(c))}<i>${cnt[c] || 0}</i></button>`).join('');
  ch.scrollLeft = sl;
  const on = ch.querySelector('.chip.on');
  if (on && (on.offsetLeft < ch.scrollLeft || on.offsetLeft + on.offsetWidth > ch.scrollLeft + ch.clientWidth)) ch.scrollLeft = on.offsetLeft - 12;
  const L = Ln(), q = $('#q').value.trim();
  $('#tools').innerHTML = (!q && st.cat !== 'fav' ? `<button class="tl" data-act="openAll" title="${esc(t('expandAll'))}" aria-label="${esc(t('expandAll'))}">⊞<span> ${esc(t('expandAll'))}</span></button><button class="tl" data-act="closeAll" title="${esc(t('collapseAll'))}" aria-label="${esc(t('collapseAll'))}">⊟<span> ${esc(t('collapseAll'))}</span></button>` : '') +
    `<select data-in="sort" aria-label="sort">${L.sort.map((s, i) => `<option value="${i}"${st.sort === i ? ' selected' : ''}>${esc(s)}</option>`).join('')}</select>` +
    `<span class="vsw">${['list','card','table'].map((v, i) => `<button class="${st.view === v ? 'on' : ''}" data-act="view" data-v="${v}" title="${esc(L.view[i])}" aria-label="${esc(L.view[i])}">${['☰','▦','▤'][i]}</button>`).join('')}</span>`;
  $('.qx').hidden = !q;
}
const coll = () => new Intl.Collator(LOCALE[st.lang]);
function defCmp(c) {
  const C = coll();
  if (c === 'eleph') return (a, b) => C.compare(nm(a), nm(b));
  if (c === 'skill') return (a, b) => (a.sc || '').localeCompare(b.sc || '') || a.r - b.r || a.i - b.i;
  if (c === 'oop') return (a, b) => a.r - b.r || a.i - b.i;
  if (c === 'gear') return (a, b) => a.t - b.t || a.i - b.i;
  if (['cur', 'tic', 'box', 'grow'].includes(c)) return (a, b) => a.i - b.i;
  return (a, b) => b.r - a.r || a.i - b.i;
}
function sortArr(arr, c) {
  const pv = it => { const v = val(it); return v ? v.p * unitOf(it) : -1; };
  if (st.sort === 1) return arr.sort((a, b) => pv(b) - pv(a));
  if (st.sort === 2) return arr.sort((a, b) => pv(a) - pv(b));
  if (st.sort === 3) { const C = coll(); return arr.sort((a, b) => C.compare(nm(a), nm(b))); }
  if (c) return arr.sort(defCmp(c));
  return arr.sort((a, b) => CORDER[a.c] - CORDER[b.c] || defCmp(a.c)(a, b));
}
function glabel(c, g, items) {
  if (c === 'event') return g === 'misc' ? tl('subs', 'event.misc') : eventName(g.slice(1));
  if (c === 'oop') { const top = items.reduce((a, x) => x.r > a.r ? x : a, items[0]); return nm(top); }
  if (c === 'eleph') return g === 'eligma' ? nm(BYK.I23) : (DATA.meta.schools[g] ? schoolName(g) : tl('subs', 'other'));
  if (c === 'furn') return tl('furnS', g);
  return tl('subs', c + '.' + g);
}
function groupsOf(c) {
  const m = new Map();
  for (const it of DATA.items) if (it.c === c && inRegion(it)) { if (!m.has(it.g)) m.set(it.g, []); m.get(it.g).push(it); }
  let gs = [...m.entries()].map(([g, items]) => ({g, items, label: glabel(c, g, items)}));
  const C = coll();
  if (c === 'event') { const ek = g => { const n = +g.slice(1) || 0; return g === 'misc' ? 3 : n < 10000 ? 0 : n < 20000 ? 1 : 2; }; gs.sort((a, b) => ek(a.g) - ek(b.g) || (+b.g.slice(1) || 0) - (+a.g.slice(1) || 0)); }
  else if (c === 'eleph') gs.sort((a, b) => (b.g === 'eligma') - (a.g === 'eligma') || C.compare(a.label, b.label));
  else if (c === 'oop') gs.sort((a, b) => (+a.g.slice(1) || 0) - (+b.g.slice(1) || 0));
  else if (GORDER[c]) { const o = GORDER[c]; const ix = g => { const i = o.indexOf(g); return i < 0 ? 99 : i; }; gs.sort((a, b) => ix(a.g) - ix(b.g)); }
  return gs;
}
function isOpen(c, g, gs) {
  const o = st.open[c];
  if (o) return o.includes(g);
  const total = gs.reduce((s, x) => s + x.items.length, 0);
  return gs.length <= 4 || total <= 60 ? true : gs[0].g === g;
}
function metaLine(it, v) {
  const parts = [];
  if (st.cols.meta) {
    if (it.c === 'gear' && it.t) parts.push('T' + it.t);
    else if (TIERED.has(it.c) && it.r && it.c !== 'grow') parts.push('T' + it.r);
    if (it.sc && it.c !== 'eleph') parts.push(schoolName(it.sc));
  }
  if (st.cols.method && v) parts.push(methodShort(it, v));
  if (st.cols.demand) { const d = rd(it); if (d) parts.push('👥' + d[1]); }
  { const x = elephX(it); if (x && st.cols.meta) parts.push(x.h ? t('elShort', {r: fmtNum(elRate(x.h))}) : t('elNoH')); }
  return parts.join(' · ');
}
function elephRoute(x) {
  const labs = (x.sup || []).map(s => s[0]);
  if (labs.includes('H')) return 'hard';
  if (labs.some(l => l.startsWith('S:') && l !== 'S:MasterCoin')) return 'shop';
  if (labs.includes('S:MasterCoin')) return 'permit';
  return [1, 3].includes(x.lim) ? 'limited' : 'eligma';
}
function methodShort(it, v) {
  if (v.m === 'custom') return t('customTag');
  if (v.m === 'eleph') return fill(tl('rt', elephRoute(v.x)));
  if (v.m === 'coin') return shopName(v.x.s);
  if (v.m === 'commission' || v.m === 'report') return stageName('WeekDungeon');
  if (v.m === 'wexp') return stageName('SchoolDungeon');
  return fill(tl('ms', v.m) === v.m ? tl('ms', 'other') : tl('ms', v.m));
}
function tags(v) {
  if (!v) return '';
  if (v.m === 'custom') return `<span class="tag">${esc(t('customTag'))}</span>`;
  if (v.m === 'rough' || v.m === 'group' || (v.m === 'ticket' && !(v.x && v.x.loot !== undefined)) || (v.x && (v.x.partial || v.x.proxy))) return `<span class="tag rough">${esc(t('rough'))}</span>`;
  if (v.m === 'col') return `<span class="tag col">${esc(t('colTag'))}</span>`;
  return '';
}
function priceCells(v, it) {
  if (!v) return `<span class="nov">${esc(t('nov'))}</span>`;
  const u = unitOf(it), P = v.p * u, sub = [];
  let s = `<b>${esc(mainPrice(P))}${u > 1 ? `<span class="per">/${fmtNum(u)}</span>` : ''}</b>`;
  if (isF2P()) sub.push(t('dayS', {d: fmtDays(daysOf(P))}));
  else { if (c2on()) sub.push(fmtCur(P * cpp(st.cur2), st.cur2)); if (st.cols.ap) sub.push(fmtNum(apOf(P)) + ' AP'); }
  if (st.cols.pyro) sub.push(fmtNum(P) + ' 💎');
  if (sub.length) s += `<small>${esc(sub.join(' · '))}</small>`;
  return s + tags(v);
}
function rowHTML(it) {
  const v = val(it);
  return `<div class="it" data-act="open" data-k="${it.k}" tabindex="0" role="button">
<span class="av r${it.r || 1}">${icon(it)}</span>
<div class="mid"><b>${esc(nm(it))}</b><small>${esc(metaLine(it, v))}</small></div>
<div class="pr">${priceCells(v, it)}</div>
<button class="star${fav[it.k] ? ' on' : ''}" data-act="fav" data-k="${it.k}" aria-label="fav">${fav[it.k] ? '★' : '☆'}</button>
<button class="plus" data-act="add" data-k="${it.k}" aria-label="+">＋</button></div>`;
}
function cardHTML(it) {
  const v = val(it);
  return `<div class="cd" data-act="open" data-k="${it.k}" tabindex="0" role="button">
<button class="star${fav[it.k] ? ' on' : ''}" data-act="fav" data-k="${it.k}" aria-label="fav">${fav[it.k] ? '★' : '☆'}</button>
<span class="av big r${it.r || 1}">${icon(it)}</span><b class="cn">${esc(nm(it))}</b>
<small class="cm">${esc(metaLine(it, v))}</small><div class="cp">${priceCells(v, it)}</div>
<button class="plus wide" data-act="add" data-k="${it.k}">＋ ${esc(t('addT'))}</button></div>`;
}
function tableHTML(arr) {
  const L = Ln(), f2p = isF2P();
  let h = `<table class="tbl"><thead><tr><th></th><th>${esc(L.sort[3])}</th><th class="num">${f2p ? 'AP' : esc(st.cur.toUpperCase())}</th>`;
  if (f2p) h += `<th class="num">${esc(t('dayU'))}</th>`;
  if (!f2p && c2on()) h += `<th class="num">${esc(st.cur2.toUpperCase())}</th>`;
  if (st.cols.pyro) h += `<th class="num">💎</th>`;
  if (!f2p && st.cols.ap) h += `<th class="num">AP</th>`;
  if (st.cols.method) h += `<th>${esc(L.cols.method)}</th>`;
  h += `<th></th></tr></thead><tbody>`;
  for (const it of arr) {
    const v = val(it), u = unitOf(it), P = v ? v.p * u : 0;
    h += `<tr data-act="open" data-k="${it.k}"><td><button class="star sm${fav[it.k] ? ' on' : ''}" data-act="fav" data-k="${it.k}" aria-label="fav">${fav[it.k] ? '★' : '☆'}</button></td>
<td class="tn"><span class="dot r${it.r || 1}"></span>${esc(nm(it))}${u > 1 ? ' ×' + fmtNum(u) : ''}${tags(v)}</td><td class="num"><b>${v ? esc(mainPrice(P)) : '—'}</b></td>`;
    if (f2p) h += `<td class="num">${v ? fmtDays(daysOf(P)) : '—'}</td>`;
    if (!f2p && c2on()) h += `<td class="num">${v ? fmtCur(P * cpp(st.cur2), st.cur2) : '—'}</td>`;
    if (st.cols.pyro) h += `<td class="num">${v ? fmtNum(P) : '—'}</td>`;
    if (!f2p && st.cols.ap) h += `<td class="num">${v ? fmtNum(apOf(P)) : '—'}</td>`;
    if (st.cols.method) h += `<td>${v ? esc(methodShort(it, v)) : ''}</td>`;
    h += `<td><button class="plus sm" data-act="add" data-k="${it.k}" aria-label="+">＋</button></td></tr>`;
  }
  return h + `</tbody></table>`;
}
function itemsHTML(arr) {
  if (st.view === 'table') return `<div class="tblwrap">${tableHTML(arr)}</div>`;
  if (st.view === 'card') return `<div class="grid">${arr.map(cardHTML).join('')}</div>`;
  return arr.map(rowHTML).join('');
}
function rangeTxt(items) {
  let lo = Infinity, hi = -Infinity;
  for (const it of items) { const v = val(it); if (!v) continue; const P = v.p * unitOf(it); if (P < lo) lo = P; if (P > hi) hi = P; }
  if (!isFinite(lo)) return '';
  return lo === hi ? mainPrice(lo) : mainPrice(lo) + ' – ' + mainPrice(hi);
}
function moreBtn(key, left) { return left > 0 ? `<button class="more" data-act="more" data-v="${esc(key)}">${esc(t('more', {n: left}))}</button>` : ''; }
function renderList() {
  if (!DATA) return;
  renderFilters();
  const box = $('#results'); box.className = 'res v-' + st.view;
  const q = $('#q').value.trim().toLowerCase();
  if (q || st.cat === 'fav') {
    const arr = sortArr(DATA.items.filter(it => inRegion(it) && (q ? it.s.includes(q) : fav[it.k])), null);
    const key = q ? 'q:' + q : 'fav', n = SHOWN.get(key) || 60;
    $('#count').textContent = (q ? t('searchAll') + ' · ' : '') + t('count', {n: arr.length});
    box.innerHTML = arr.length ? `<div class="flat">${itemsHTML(arr.slice(0, n))}${moreBtn(key, arr.length - n)}</div>` : `<p class="empty">${esc(t('noResult'))}</p>`;
    return;
  }
  const c = st.cat, gs = groupsOf(c);
  const total = gs.reduce((s, x) => s + x.items.length, 0);
  $('#count').textContent = t('countG', {n: total, g: gs.length});
  box.innerHTML = gs.map(({g, items, label}) => {
    const open = isOpen(c, g, gs), key = c + '|' + g;
    let body = '';
    if (open) {
      const arr = sortArr(items.slice(), c), n = SHOWN.get(key) || (st.view === 'table' ? 20 : PAGE);
      body = `<div class="gb">${itemsHTML(arr.slice(0, n))}${moreBtn(key, arr.length - n)}</div>`;
    }
    const gi = c === 'event' || c === 'oop' || c === 'eleph' ? CICON[c] : (GICON[c + '.' + g] || CICON[c]);
    return `<section class="grp${open ? ' open' : ''}"><button class="gh" data-act="grp" data-v="${esc(g)}" aria-expanded="${open}"><span class="chev">▶</span><span>${gi}</span><b>${esc(label)}</b><span class="rng">${esc(rangeTxt(items))}</span><span class="gn">${items.length}</span></button>${body}</section>`;
  }).join('');
}

/* ---------------- explanation ---------------- */
function explain(it) {
  const bv = baseVal(it); if (!bv) return [];
  const v = rv(it) || [bv.a, 0, bv.m, bv.x];
  const a = v[0], p = v[1], m = bv.m, x = bv.x || {}, out = [], r = ar();
  switch (m) {
    case 'base': out.push(t('exBase', {r})); break;
    case 'official': out.push(t('exOfficial', {n: x.n, p: fmtNum(p)})); break;
    case 'commission': out.push(t('exCommission', {st: stageName('WeekDungeon'), cr: fmtNum(x.cr)})); break;
    case 'report': out.push(t('exReport', {st: stageName('WeekDungeon'), r: fmtNum(x.r), e: fmtNum(x.e)})); break;
    case 'wexp': out.push(t('exWexp', {st: stageName('SchoolDungeon'), r: fmtNum(x.r), e: fmtNum(x.e)})); break;
    case 'normal': out.push(t('exNormal', {t: x.t, a: fmtNum(a)})); break;
    case 'credit': out.push(t('exCredit', {pr: fmtNum(x.pr)})); break;
    case 'coin': out.push(t('exCoin', {shop: shopName(x.s), pr: fmtNum(x.pr), coin: nm(BYK[x.ck]) || x.ck, cv: fmtNum(x.cv)})); break;
    case 'coinrate': out.push(t('exCoinrate')); break;
    case 'choice': out.push(t('exChoice', {b: BYK[x.b] ? nm(BYK[x.b]) : x.b})); break;
    case 'random': out.push(t('exRandom', {n: x.n})); break;
    case 'group': out.push(t('exGroup')); break;
    case 'eligma': out.push(t('exEligma', {n: x.n})); break;
    case 'recipe': out.push(t('exRecipe')); break;
    case 'pull': out.push(t('exPull', {n: x.n || 1, p: fmtNum(p)})); break;
    case 'g3': out.push(t('exG3', {p: fmtNum(p)})); break;
    case 'spark': out.push(t('exSpark', {p: fmtNum(p)})); out.push(t('exSparkOwned')); break;
    case 'point': out.push(t('exPoint')); break;
    case 'monthly': out.push(t('exMonthly', {d: x.days || 30}));
      if (x.tix) out.push(t('exTix', {t: Object.entries(x.tix).map(([k, n]) => (BYK[k] ? nm(BYK[k]) : k) + ' ×' + fmtNum(n)).join('、')}));
      break;
    case 'selpack': out.push(t('exSelpack')); if (x.proxy) out.push(t('exProxy')); if (x.partial) out.push(t('exPartial')); break;
    case 'ecoin': out.push(t('exEcoin', {ev: x.ev ? eventName(x.ev) : '—'})); break;
    case 'shopx': out.push(t('exShopx', {n: x.ns || 1})); break;
    case 'craft': out.push(t('exCraft', {t: x.t || ''})); break;
    case 'furn': out.push(t('exFurn', {cb: fmtNum(x.cb), pc: fmtNum(x.pc || 0.066)})); break;
    case 'col': out.push(t('exCol')); break;
    case 'rough':
      if (it.c === 'cur' && it.g === 'ticket') out.push(t('exTicket'));
      else if (x.byprice) out.push(t('exByPrice', {k: fmtCur(x.krw, 'krw', true)}));
      else if (x.as && BYK[x.as]) out.push(t('exSame', {as: nm(BYK[x.as])}));
      else out.push(t('exRough'));
      break;
    case 'ticket': out.push(x.loot !== undefined ? t('exLoot', {l: fmtNum(x.loot), ap: fmtNum(x.ap || 0)}) : t('exTicket')); break;
    case 'pass': if (x.up) out.push(t('exPassUp', {lvp: fmtNum(x.lvp), lv: fmtNum(x.lv)})); else { out.push(t('exPass', {pr: fmtNum(x.prem), lv: fmtNum(x.lv)})); if (x.gp) out.push(t('exPassG', {g: fmtNum(x.gp)})); } break;
    case 'box': out.push(t(x.bx === 'c' ? 'exBoxC' : x.bx === 'a' ? 'exBoxA' : 'exBoxR', {n: x.n || '?'})); break;
    case 'same': out.push(t(x.n ? 'exSameN' : 'exSame', {n: fmtNum(x.n || 1), as: BYK[x.as] ? nm(BYK[x.as]) : x.as})); break;
    case 'loot': out.push(t('exLoot')); break;
    case 'eleph': {
      const cfg = DATA.meta.cfg; out.push(t('supT', {D: cfg.eleph_D}));
      const merged = [];
      for (const [lab, u, q] of x.sup || []) { const last = merged[merged.length - 1]; if (last && last[0] === lab && Math.abs(last[1] - u) < 0.01) last[2] += q; else merged.push([lab, u, q]); }
      out.push({sub: merged.map(([lab, u, q]) => t('supLine', {s: lab === 'H' ? t('supH') : lab.startsWith('E') ? t('supE', {n: lab.slice(1)}) : shopName(lab.slice(2)), q: fmtNum(q), u: fmtNum(u)}))});
      out.push(t('supRes', {N: cfg.eleph_N, v: fmtNum(a)}));
      break; }
    default: out.push(t('exUnknown'));
  }
  if (x.krw && !x.byprice) out.push(t('exKrw', {k: fmtCur(x.krw, 'krw', true), x: rate('krw') ? fmtCur(x.krw / rate('krw') * rate(st.cur)) : '—'}));
  if (x.buy) out.push(t('exBuy', {b: fmtNum(x.buy), x: money(x.buy, isF2P() ? 'lite' : st.prof)}));
  if (['oop', 'skill'].includes(it.c) && x.fa !== undefined) {
    if (x.fa === 1) out.push(t('exFarmSame'));
    else if (x.fn || x.fh) out.push(t('exFarmY', {n: (x.fn || 0) + (x.fh || 0), f: fx2(x.fa)}));
    else out.push(t('exFarmN', {f: fx2(x.fa)}));
  }
  if (bv.f !== 1) out.push(t('exDem', {f: fx2(bv.f)}));
  out.push(bv.pyroOnly ? t('exPy', {p: fmtNum(bv.p)}) : t('exAp', {a: fmtNum(bv.a), r, p: fmtNum(bv.p)}));
  if (isF2P()) out.push(t('exF2P', {a: fmtNum(bv.a), d: fmtNum(st.dailyAP), n: fmtDays(daysOf(bv.p))}));
  else out.push(t('exCash', {p: fmtNum(bv.p), c: fmtCur(cpp()), prof: profName(st.prof), x: money(bv.p)}));
  return out;
}
function srcChips(it) {
  const L = Ln();
  return (it.src || []).map(s => {
    if (s.startsWith('S:')) return `<span class="sch">🏪 ${esc(shopName(s.slice(2)))}</span>`;
    if (/^N\d+$/.test(s)) return `<span class="sch">🗺️ ${esc(fill(L.srcN, {n: s.slice(1)}))}</span>`;
    if (/^H\d+$/.test(s)) return `<span class="sch">⚔️ ${esc(fill(L.srcH, {n: s.slice(1)}))}</span>`;
    if (s === 'C') return `<span class="sch">📋 ${esc(stageName('WeekDungeon'))}</span>`;
    if (s === 'W') return `<span class="sch">🏫 ${esc(stageName('SchoolDungeon'))}</span>`;
    if (s === 'E') return `<span class="sch">🔮 ${esc(t('srcE'))}</span>`;
    if (s === 'G') return `<span class="sch">🎰 ${esc(L.srcG)}</span>`;
    return '';
  }).join('');
}
function campSeg() { return `<span class="seg">${[1, 2, 3].map(m => `<button class="${(st.camp || 1) === m ? 'on' : ''}" data-act="set" data-k="camp" data-v="${m}">×${m}</button>`).join('')}</span>`; }
function elephBox(it) {
  const x = elephX(it); if (!x) return '';
  let h = `<h4>⚔️ ${esc(t('elT'))}</h4>`;
  if (x.h) {
    const r = elRate(x.h);
    h += `<p class="elf">${esc(t('elH', {h: x.h, r: fmtNum(r)}))}</p><div class="hx">${esc(t('camp'))} ${campSeg()}</div>
<div class="eld">${[10, 20, 50, 100].map(n => `<span>${esc(t('elDays', {n, d: fmtNum(Math.ceil(n / r * 10) / 10, 3)}))}</span>`).join('')}</div>`;
  } else h += `<p class="elf mu">${esc(t('elH0'))}</p>`;
  return h;
}
function openItem(k) {
  const it = BYK[k]; if (!it) return;
  const v = val(it), L = Ln(), d = rd(it), rv0 = rv(it), u = unitOf(it);
  const lim = rv0 && rv0[3] && rv0[3].lim;
  const g = groupsOf(it.c).find(x => x.g === it.g);
  const sub = [catLabel(it.c) + (g ? ' › ' + g.label : '') + (it.c === 'gear' && it.t ? ' T' + it.t : TIERED.has(it.c) && it.r && it.c !== 'grow' ? ' T' + it.r : '')];
  if (it.sc && it.c !== 'eleph') sub.push(schoolName(it.sc));
  if (it.c === 'eleph' && lim !== undefined) sub.push(lim ? (DATA.meta.lim[lim] || [])[li()] || lim : t('perm'));
  const cv = custom[k];
  const steps = v && v.m === 'custom' ? [t('exCustom')] : explain(it);
  let h = `<div class="shh"><span class="av big r${it.r || 1}">${icon(it)}</span><div class="sht"><h3>${esc(nm(it))}</h3><small>${esc(sub.join(' · '))}</small></div>
<button class="x" data-act="close" aria-label="close">✕</button></div>`;
  if (v) {
    const P = v.p * u;
    const rows = [...PROFS, ...(st.prof === 'custom' ? ['custom'] : [])].map(p => `<div class="${st.prof === p ? 'on' : ''}"><span>${PICON[p]} ${esc(profName(p))}</span><b>${p === 'f2p' ? esc(fmtNum(apOf(P)) + ' AP · ' + t('dayS', {d: fmtDays(daysOf(P))})) : esc(money(P, p))}${p !== 'f2p' && c2on() ? ' · ' + esc(fmtCur(P * cpp(st.cur2, p), st.cur2)) : ''}</b></div>`).join('');
    h += `<div class="pbox"><div class="p1">${esc(mainPrice(P))}${u > 1 ? `<span class="per">/${fmtNum(u)}</span>` : ''}${tags(v)}</div><div class="p2">${esc(fmtNum(P) + ' 💎 · ' + (isF2P() ? t('dayS', {d: fmtDays(daysOf(P))}) : fmtNum(apOf(P)) + ' AP'))}</div>
<div class="prof3">${rows}</div></div>`;
  } else h += `<div class="pbox"><div class="p1 nov">${esc(t('nov'))}</div></div>`;
  h += `<div class="acts"><button class="btn${fav[k] ? ' pri' : ''}" data-act="fav" data-k="${k}">${esc(fav[k] ? t('unfav') : t('fav'))}</button>
<span class="stepper"><button data-act="dq" data-v="-1" aria-label="-">−</button><input id="dq" type="number" min="1" value="1" inputmode="numeric" aria-label="${esc(t('qty'))}"><button data-act="dq" data-v="1" aria-label="+">＋</button></span>
<button class="btn pri" data-act="addq" data-k="${k}">＋ ${esc(t('addT'))}</button></div>`;
  h += elephBox(it);
  if (steps.length) {
    let sh = '', open = false;
    for (const s of steps) {
      if (typeof s === 'string') { if (open) sh += '</li>'; sh += `<li>${esc(s)}`; open = true; }
      else sh += `<ul class="subl">${s.sub.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
    }
    if (open) sh += '</li>';
    h += `<h4>${esc(t('how'))}</h4><ol class="steps">${sh}</ol>`;
  }
  if (it.src && it.src.length) h += `<h4>${esc(t('srcT'))}</h4><div class="schips">${srcChips(it)}</div>`;
  if (d) h += `<h4>${esc(t('demT'))}</h4><p class="mu">${esc(d[1] ? t('demTxt', {u: d[1], n: fmtNum(d[2]), m: fmtNum(d[3])}) : t('demNone'))}${st.mode === 'dem' ? ` <span class="tag">×${fx2(d[0])}</span>` : ''}</p>`;
  const cc = isF2P() ? cpp(st.cur, 'lite') : cpp();
  h += `<details${cv != null ? ' open' : ''}><summary>${esc(t('customT'))}</summary><p class="mu">${esc(t('customHint', {cur: st.cur.toUpperCase()}))}</p>
<form class="cust" data-k="${k}"><input id="cv" type="number" min="0" step="any" inputmode="decimal" value="${cv != null && cc ? +(cv * cc).toPrecision(4) : ''}" aria-label="${esc(t('customT'))}"><button class="btn pri">${esc(t('save'))}</button><button class="btn" type="button" data-act="cclear" data-k="${k}">${esc(t('clear'))}</button></form></details>
<details><summary>${esc(t('namesT'))}</summary><div class="names">${LANGS.map((l, i) => `<div><span>${LANG_NAME[l]}</span>${esc(it.n[i])}</div>`).join('')}</div></details>`;
  openSheet(h, 'item:' + k);
}

/* ---------------- pack page ---------------- */
function refPerPyro(r) { return r.twd / (r.p + r.ap * ar()); }
function packCalc(items, price, cur) {
  let tot = 0, off = 0; const parts = [];
  for (const p of items) {
    const it = BYK[p.k]; if (!it) continue;
    if (p.off) { off++; continue; }
    const v = val(it); if (v) { tot += v.p * p.q; parts.push([it, v.p * p.q]); }
  }
  const pc = cur || st.cur, pr = parseFloat(price);
  const twd = pr > 0 && rate(pc) && rate('twd') ? pr / rate(pc) * rate('twd') : 0;
  const ratio = prof => twd ? tot * twdPP(prof) / twd : 0;
  const days = tot / ar() / Math.max(1, st.dailyAP);
  return {tot, off, parts, twd, ratio, days, ps: twd ? twdTo(twd) : 0};
}
const vIdx = r => r >= 2 ? 0 : r >= 1.2 ? 1 : r >= 0.9 ? 2 : 3;
let ratVis = true;
if ('IntersectionObserver' in window) new IntersectionObserver(es => { ratVis = es[0].isIntersecting; $('#ratPill').classList.toggle('hide', ratVis); }, {threshold: 0.1}).observe($('#ratCard'));
function renderPack() {
  if (!DATA) return;
  $('#st2').textContent = t('step2'); $('#st3').textContent = t('step3'); $('#st4').textContent = t('step4'); $('#stSaved').textContent = t('myPacks');
  $('#quickLbl').textContent = t('quick');
  $('#quick').innerHTML = QUICK.map(([k, q]) => BYK[k] ? `<button class="qb" data-act="add" data-k="${k}" data-q="${q}">${icon(BYK[k])} ${esc(nm(BYK[k]))}${q > 1 ? ' ×' + fmtNum(q) : ''}</button>` : '').join('');
  $('#ps').placeholder = t('addSearch');
  $('#clearPack').textContent = t('clearPack');
  if (document.activeElement !== $('#pPrice')) $('#pPrice').value = pack.price;
  $('#pPrice').placeholder = '0';
  $('#pCurBtn').innerHTML = `${esc((pack.cur || st.cur).toUpperCase())} <span class="car">▾</span>`;
  $('#pName').placeholder = t('nameP'); if (document.activeElement !== $('#pName')) $('#pName').value = pack.name || '';
  $('#saveBtn').textContent = t('saveT'); $('#copyBtn').textContent = t('copy');
  $('#prows').innerHTML = pack.items.length ? pack.items.map((p, i) => {
    const it = BYK[p.k]; if (!it) return '';
    const v = val(it), x = elephX(it), on = !p.off;
    let el = '';
    if (x) el = x.h ? `<span class="elx">⚔️ ${esc(t('elLine', {h: x.h, r: fmtNum(elRate(x.h)), d: fmtNum(Math.ceil(p.q / elRate(x.h) * 10) / 10, 3)}))}</span>` : `<span class="elx">⚔️ ${esc(t('elH0s'))}</span>`;
    return `<div class="prow${on ? '' : ' off'}"><span class="av sm r${it.r || 1}">${icon(it)}</span><div class="mid" data-act="open" data-k="${it.k}"><b>${esc(nm(it))}</b><small>${v ? esc(mainPrice(v.p * unitOf(it))) + (unitOf(it) > 1 ? ' / ' + fmtNum(unitOf(it)) : '') : esc(t('nov'))}</small>${el}</div>
<span class="stepper sm"><button data-act="pq" data-i="${i}" data-v="-1" aria-label="-">−</button><input type="number" min="0" step="1" inputmode="numeric" value="${p.q}" data-in="pq" data-i="${i}" aria-label="${esc(t('qty'))}"><button data-act="pq" data-i="${i}" data-v="1" aria-label="+">＋</button></span>
<span class="sub" data-sub="${i}"></span><button class="need${on ? ' on' : ''}" data-act="need" data-i="${i}" aria-pressed="${on}">${on ? '✓ ' : ''}${esc(t('need'))}</button><button class="rm" data-act="rm" data-i="${i}" aria-label="remove">✕</button></div>`;
  }).join('') : `<p class="empty">${esc(t('packEmpty'))}</p>`;
  $('#needHint').textContent = pack.items.length ? t('needHint') : '';
  renderResult(); renderSaved();
}
function ladderHTML(R) {
  const rows = REF.map(r => ({lab: tl('refN', r.id), pp: refPerPyro(r), cls: r.id === 'half' || r.id === 'month' ? 'ref' : ''}));
  if (R.twd && R.tot > 0) rows.push({lab: '👉 ' + (pack.name || t('thisPack')), pp: R.twd / R.tot, cls: 'me'});
  rows.sort((a, b) => a.pp - b.pp);
  return `<div class="ladder">${rows.map(r => `<div class="lrow ${r.cls}"><span>${esc(r.lab)}</span><b>${esc(fmtCur(twdTo(r.pp), st.cur))}/💎</b></div>`).join('')}</div>`;
}
function renderResult() {
  const L = Ln();
  pack.items.forEach((p, i) => { const it = BYK[p.k]; const s = document.querySelector(`[data-sub="${i}"]`); if (it && s) { const v = val(it); s.textContent = v ? mainPrice(v.p * p.q) : '—'; } });
  const R = packCalc(pack.items, pack.price, pack.cur);
  /* ① profile + ratio card */
  let big = '', others = '';
  const oth = (st.prof === 'custom' ? ['lite', 'whale'] : PROFS.filter(p => p !== st.prof && p !== 'f2p'));
  if (isF2P()) {
    big = R.tot > 0 ? `<div class="rbig f2p"><small>${esc(t('f2pBig'))}</small><b>${esc(t('dayS', {d: fmtDays(R.days)}))}</b><strong>${esc(fmtNum(apOf(R.tot)) + ' AP')}</strong></div>` : `<div class="rbig none">${esc(t('packEmpty2'))}</div>`;
    if (R.twd && R.days > 0) others = t('f2pCost', {c: fmtCur(R.ps / R.days)}) + ' · ';
    if (R.twd) others += oth.map(p => `${PICON[p]} ${profName(p)} ${R.ratio(p).toFixed(2)}×`).join(' · ');
  } else if (R.twd && R.tot > 0) {
    const r = R.ratio(st.prof), k = vIdx(r);
    big = `<div class="rbig v${k}"><small>${esc(t('ratioOf', {p: profName(st.prof)}))}</small><b>${r.toFixed(2)}×</b><strong>${esc(L.verdict[k])}</strong></div>`;
    others = [...oth.filter(p => p !== st.prof)].map(p => `${PICON[p]} ${profName(p)} ${R.ratio(p).toFixed(2)}×`).join(' · ') + ` · 🐢 ${t('dayS', {d: fmtDays(R.days)})}`;
  } else big = `<div class="rbig none">${esc(R.tot > 0 ? t('needPrice') : t('packEmpty2'))}</div>`;
  $('#ratCard').innerHTML = `<div class="rc-h"><h3>${esc(t('step1'))}</h3><button class="info" data-act="profinfo" aria-label="info">ⓘ</button></div>
<div class="rc-b">${profSeg('sm')}${big}</div>${others ? `<p class="rc-o">${esc(others)}</p>` : ''}`;
  /* ④ details */
  let h = '';
  if (R.twd && R.tot > 0 && !isF2P()) {
    const r = R.ratio(st.prof), pos = Math.min(r, 3) / 3 * 100;
    h += `<div class="gauge"><div class="zn z3" style="width:30%">${esc(L.zones[0])}</div><div class="zn z2" style="width:10%">${esc(L.zones[1])}</div><div class="zn z1" style="width:26.67%">${esc(L.zones[2])}</div><div class="zn z0" style="width:33.33%">${esc(L.zones[3])}</div><i class="needle" style="left:${pos}%"></i></div>
<p class="rtxt">${esc(t('resultTxt', {v: money(R.tot), p: fmtCur(R.ps), r: fmtNum(r)}))}</p>`;
  }
  if (isF2P() && R.tot > 0) h += `<p class="rtxt">${esc(t('f2pTxt', {ap: fmtNum(apOf(R.tot)), d: fmtDays(R.days), da: fmtNum(st.dailyAP)}))}</p>`;
  h += `<div class="kv"><span>${esc(t('total'))}</span><b>${esc(isF2P() ? fmtNum(apOf(R.tot)) + ' AP' : money(R.tot))}${!isF2P() && c2on() ? ` <small>${esc(fmtCur(R.tot * cpp(st.cur2), st.cur2))}</small>` : ''}</b></div>
<div class="kv"><span>${esc(t('eq'))}</span><b>${fmtNum(R.tot)} 💎</b></div>`;
  if (R.ps) h += `<div class="kv"><span>${esc(t('price'))}</span><b>${esc(fmtCur(R.ps))}${R.tot > 0 ? ` <small>(${esc(t('perPyroPack', {x: fmtCur(R.ps / R.tot)}))})</small>` : ''}</b></div>`;
  if (R.off) h += `<p class="hint">${esc(t('excluded', {n: R.off}))}</p>`;
  if (st.prof !== 'whale') h += `<h4>${esc(t('cmpT'))}</h4>${ladderHTML(R)}<p class="hint">${esc(t('cmpHint'))}</p>`;
  else h += `<p class="hint">${esc(t('whaleHint', {x: fmtCur(cpp())}))}</p>`;
  if (R.parts.length && R.tot > 0) {
    const top = R.parts.sort((a, b) => b[1] - a[1]).slice(0, 6);
    h += `<h4>${esc(t('shareT'))}</h4>` + top.map(([it, x]) => `<div class="bar"><span>${icon(it)} ${esc(nm(it))}</span><div><i style="width:${(x / R.tot * 100).toFixed(1)}%"></i></div><em>${Math.round(x / R.tot * 100)}%</em></div>`).join('');
  }
  h += `<p class="hint">${esc(t('ratioHint'))}</p>`;
  $('#result').innerHTML = h;
  $$('[data-tab="1"] i').forEach(e => e.textContent = pack.items.length || '');
  const pill = $('#ratPill'), hide = ratVis ? ' hide' : '';
  if (page() === 'pack' && R.tot > 0 && (isF2P() || R.twd)) {
    const r = isF2P() ? null : R.ratio(st.prof);
    pill.className = 'on ' + (isF2P() ? 'f2p' : 'v' + vIdx(r)) + hide;
    pill.textContent = isF2P() ? '🐢 ' + t('dayS', {d: fmtDays(R.days)}) : PICON[st.prof] + ' ' + r.toFixed(2) + '×';
  } else pill.className = '';
}
function renderSaved() {
  $('#savedList').innerHTML = saved.list.length ? saved.list.map((s, i) => {
    const R = packCalc(s.items, s.price, s.cur);
    const r = R.twd ? R.ratio(isF2P() ? 'lite' : st.prof) : 0, k = R.twd && R.tot > 0 ? vIdx(r) : -1;
    return `<div class="svd"><div class="mid"><b>${esc(s.name || '—')}</b><small>${s.items.length} · ${s.price ? esc(fmtCur(parseFloat(s.price), s.cur || st.cur, true)) : '—'}</small></div>
${k >= 0 ? `<span class="rpill v${k}">${r.toFixed(2)}×</span>` : '<span></span>'}<button class="btn sm" data-act="sload" data-i="${i}">${esc(t('load'))}</button><button class="btn sm" data-act="sdel" data-i="${i}">${esc(t('del'))}</button></div>`;
  }).join('') : `<p class="empty">${esc(t('noSaved'))}</p>`;
}
function addToPack(k, q = 1) {
  const e = pack.items.find(x => x.k === k);
  if (e) e.q += q; else pack.items.push({k, q});
  persist(); toast(t('added')); renderPack(); renderChrome();
}
function copyText() {
  const R = packCalc(pack.items, pack.price, pack.cur), L = Ln();
  const lines = [pack.name ? `【${pack.name}】` : '', `${PICON[st.prof]} ${profName(st.prof)}`];
  if (R.twd) lines.push(`${t('price')}: ${fmtCur(R.ps)} | ${t('total')}: ${money(R.tot, isF2P() ? 'lite' : st.prof)} | ` + PROFS.filter(p => p !== 'f2p').map(p => `${profName(p)} ${R.ratio(p).toFixed(2)}×`).join(' / ') + (isF2P() ? '' : ` ${L.verdict[vIdx(R.ratio(st.prof))]}`));
  lines.push(`🐢 ${fmtNum(apOf(R.tot))} AP ≈ ${t('dayS', {d: fmtDays(R.days)})}`);
  for (const p of pack.items) { const it = BYK[p.k]; if (!it) continue; const v = val(it); lines.push(`- ${nm(it)} ×${p.q}${p.off ? ' (' + t('needOff') + ')' : ''} = ${v ? mainPrice(v.p * p.q) : t('nov')}`); }
  return lines.filter(Boolean).join('\n');
}

/* ---------------- profile info ---------------- */
function profInfoHTML() {
  const rows = REF.map(r => `<tr><td>${esc(tl('refN', r.id))}</td><td>${esc(fmtNum(r.p) + ' 💎' + (r.ap ? ' + ' + fmtNum(r.ap) + ' AP' : ''))}</td><td>${esc(fmtCur(r.twd, 'twd', true))}</td><td>${esc(fmtCur(r.twd / (r.p + r.ap * ar()), 'twd'))}</td></tr>`).join('');
  return `<p class="mu">${esc(t('profInfoTxt'))}</p>
<ul class="notes">${['f2p', 'lite', 'whale'].map(p => `<li><b>${PICON[p]} ${esc(profName(p))}</b>：${esc(t('profL_' + p))}</li>`).join('')}</ul>
<h4>${esc(t('iosT'))}</h4><div class="iosw"><table class="itab"><thead><tr><th>${esc(t('colPack'))}</th><th>${esc(t('colGet'))}</th><th>${esc(t('colPrice'))}</th><th>${esc(t('colPer'))}</th></tr></thead><tbody>${rows}</tbody></table></div>
<p class="hint">${esc(t('iosNote'))}</p>`;
}
function openProfInfo() {
  openSheet(`<div class="shh"><div class="sht"><h3>ⓘ ${esc(t('profInfo'))}</h3></div><button class="x" data-act="close" aria-label="close">✕</button></div>${profInfoHTML()}
<label class="lbl">${esc(t('dailyAP'))}</label>${dailyCtl()}<label class="lbl">${esc(t('camp'))}</label>${campSeg()}
<div class="sfoot"><button class="btn pri wide" data-act="close">${esc(t('done'))}</button></div>`, 'info');
}
function dailyCtl() {
  return `<div class="presets"><input class="sminp" type="number" min="1" step="1" inputmode="numeric" data-in="dailyAP" value="${st.dailyAP}" aria-label="${esc(t('dailyAP'))}">${DAILY_P.map((x, i) => `<button class="btn sm${st.dailyAP === x ? ' pri' : ''}" data-act="daily" data-v="${x}">${esc(Ln().dailyP[i])}</button>`).join('')}</div>`;
}

/* ---------------- help page ---------------- */
function renderHelp() {
  if (!DATA) return;
  const L = Ln(), m = DATA.meta, a = m.anchors[st.region] || m.anchors[1];
  const coins = Object.entries(m.coins[st.region] || {}).concat([['I23', null]]).map(([k]) => {
    const it = BYK[k]; if (!it) return ''; const b = baseVal(it);
    return `<div class="kv"><span>${icon(it)} ${esc(nm(it))}</span><b>${b ? fmtNum(b.a) + ' AP' : '—'}</b></div>`;
  }).join('');
  $('#helpBody').innerHTML = `<div class="card"><h3>${esc(t('helpT'))}</h3>
<div class="gsteps"><div><span>📋</span><b>${esc(t('g1T'))}</b><p>${esc(t('g1'))}</p></div><div><span>🌙</span><b>${esc(t('g2T'))}</b><p>${esc(t('g2'))}</p></div><div><span>🎁</span><b>${esc(t('g3T'))}</b><p>${esc(t('g3'))}</p></div></div>
<button class="btn" data-act="guide">${esc(t('showGuide'))}</button></div>
<div class="card"><h3>ⓘ ${esc(t('profInfo'))}</h3>${profInfoHTML()}</div>
<div class="card faq">${L.faq.map(([q, ans], i) => `<details${i === 0 ? ' open' : ''}><summary>${esc(fill(q))}</summary><p>${esc(fill(ans))}</p></details>`).join('')}</div>
<div class="card"><details><summary>${esc(t('advT'))}</summary><p class="mu">${esc(t('anchors', {cr: fmtNum(a.creditPerAP), ex: fmtNum(a.expPerAP), we: fmtNum(a.wexpPerAP), el: fmtNum(a.elephAP), b: m.built}))}</p>
<h4>${esc(t('coinsT'))}</h4>${coins}<p class="mu">${esc(t('coinNote'))}</p></details></div>
<p class="foot">${esc(t('srcList'))}<br>${esc(t('commList'))}<br>${esc(t('disclaimer'))}</p>`;
}

/* ---------------- sheets ---------------- */
function openSheet(html, kind) { const y = sheetKind === kind ? $('#sheetBody').scrollTop : 0; sheetKind = kind; $('#sheetBody').innerHTML = html; $('#sheetWrap').classList.add('on'); $('#sheetBody').scrollTop = y; document.body.classList.add('lock'); }
function closeSheet() { sheetKind = ''; $('#sheetWrap').classList.remove('on'); document.body.classList.remove('lock'); }
function seg(name, opts, cur) { return `<div class="seg">${opts.map(([v, lbl]) => `<button class="${String(cur) === String(v) ? 'on' : ''}" data-act="set" data-k="${name}" data-v="${v}">${esc(lbl)}</button>`).join('')}</div>`; }
function openSettings() {
  const L = Ln(), adv = sheetKind === 'settings' && $('#advD') ? $('#advD').open : false;
  const h = `<div class="shh"><div class="sht"><h3>⚙️ ${esc(t('setT'))}</h3></div><button class="x" data-act="close" aria-label="close">✕</button></div>
<h4>${esc(t('secPrice'))}</h4>
<div class="two"><div><label class="lbl">${esc(t('cur'))}</label><button class="pick" data-act="curpick" data-v="cur">${esc(st.cur.toUpperCase())} ${esc(curName(st.cur))} ▾</button></div>
<div><label class="lbl">${esc(t('cur2'))}</label><button class="pick" data-act="curpick" data-v="cur2">${st.cur2 ? esc(st.cur2.toUpperCase() + ' ' + curName(st.cur2)) : esc(t('none'))} ▾</button></div></div>
<label class="lbl">${esc(t('profT'))}</label>${profSeg('sm')}
<label class="lbl">${esc(t('dailyAP'))}</label>${dailyCtl()}
<label class="lbl">${esc(t('camp'))}</label>${campSeg()}
<h4>${esc(t('secLook'))}</h4>
<label class="lbl">${esc(t('theme'))}</label><div class="swatches">${THEMES.map(x => `<button class="sw sw-${x}${st.theme === x ? ' on' : ''}" data-act="set" data-k="theme" data-v="${x}"><i></i>${esc(L.themes[x])}</button>`).join('')}</div>
<label class="lbl">${esc(t('fs'))}</label>${seg('fs', ['s','m','l','xl'].map((x, i) => [x, L.fsN[i]]), st.fs)}
<label class="lbl">${esc(t('viewT'))}</label>${seg('view', ['list','card','table'].map((x, i) => [x, L.view[i]]), st.view)}
<label class="lbl">${esc(t('colsT'))}</label><div class="checks">${COLS.map(c => `<label><input type="checkbox" data-in="col" data-k="${c}"${st.cols[c] ? ' checked' : ''}> ${esc(L.cols[c])}</label>`).join('')}</div>
<details class="adv" id="advD"${adv ? ' open' : ''}><summary>${esc(t('secAdv'))}</summary>
<label class="lbl">${esc(t('customProf'))}</label>
<div class="three"><label><small>${esc(t('amt'))}</small><input type="number" min="1" step="1" inputmode="decimal" data-in="cAmt" value="${st.cAmt}"></label>
<label><small>${esc(t('bprice'))}</small><input type="number" min="0" step="any" inputmode="decimal" data-in="cPrice" value="${st.cPrice}"></label>
<label><small>${esc(t('bcur'))}</small><button class="pick" data-act="curpick" data-v="cCur">${esc(st.cCur.toUpperCase())} ▾</button></label></div>
<div class="presets"><button class="btn sm${st.prof === 'custom' ? ' pri' : ''}" data-act="prof" data-v="custom">${PICON.custom} ${esc(t('useCustom'))}</button></div>
<label class="lbl">${esc(t('apRate'))}</label><div class="presets"><input class="sminp" type="number" min="0.01" step="any" inputmode="decimal" data-in="apRate" value="${st.apRate}" aria-label="${esc(t('apRate'))}">${L.apP.map((x, i) => `<button class="btn sm${Math.abs(st.apRate - [0.25, 0.5][i]) < 0.001 ? ' pri' : ''}" data-act="apP" data-v="${[0.25, 0.5][i]}">${esc(x)}</button>`).join('')}</div>
<p class="hint">${esc(t('apHint'))}</p>
<label class="lbl">${esc(t('server'))}</label>${seg('region', L.srv.map((s, i) => [i, s]), st.region)}
<label class="lbl">${esc(t('mode'))}</label>${seg('mode', [['acq', t('modeAcq')], ['dem', t('modeDem')]], st.mode)}<p class="hint">${esc(t('modeHint'))}</p>
</details>
<h4>${esc(t('secData'))}</h4>
<div class="btns"><button class="btn" data-act="clearCustom">${esc(t('clearCustom', {n: Object.keys(custom).length}))}</button><button class="btn" data-act="clearFav">${esc(t('clearFav', {n: Object.keys(fav).length}))}</button>
<button class="btn" data-act="guide">${esc(t('showGuide'))}</button><button class="btn danger" data-act="resetAll">${esc(t('resetAll'))}</button></div>
<div class="sfoot"><button class="btn pri wide" data-act="close">${esc(t('done'))}</button></div>`;
  openSheet(h, 'settings');
}
function openLang() {
  openSheet(`<div class="shh"><div class="sht"><h3>🌐 ${esc(t('langT'))}</h3></div><button class="x" data-act="close" aria-label="close">✕</button></div>
<div class="plist">${LANGS.map(l => `<button class="${st.lang === l ? 'on' : ''}" data-act="setLang" data-v="${l}">${LANG_NAME[l]}</button>`).join('')}</div>`, 'lang');
}
let curFrom = '';
function openCur(target) {
  curFrom = sheetKind === 'settings' ? 'settings' : '';
  curTarget = target;
  const sel = target === 'price' ? (pack.cur || st.cur) : st[target];
  openSheet(`<div class="shh"><div class="sht"><h3>💱 ${esc(t(target === 'cur2' ? 'cur2' : 'cur'))}</h3></div><button class="x" data-act="close" aria-label="close">✕</button></div>
<input id="curQ" type="search" placeholder="${esc(t('curSearch'))}" aria-label="${esc(t('curSearch'))}"><div id="curList" class="plist cur"></div>`, 'cur');
  renderCurList(sel);
}
function renderCurList(sel) {
  const q = ($('#curQ') ? $('#curQ').value : '').trim().toLowerCase();
  const codes = Object.keys(FX.usd);
  const pop = POPULAR.filter(c => FX.usd[c]);
  const rest = codes.filter(c => !pop.includes(c)).sort();
  const match = c => !q || c.includes(q) || curName(c).toLowerCase().includes(q);
  const btn = c => `<button class="${c === sel ? 'on' : ''}" data-act="setCur" data-v="${c}"><b>${c.toUpperCase()}</b> ${esc(curName(c))}</button>`;
  let h = '';
  if (curTarget === 'cur2') h += `<button class="${!st.cur2 ? 'on' : ''}" data-act="setCur" data-v="">${esc(t('none'))}</button>`;
  const p = pop.filter(match), r = rest.filter(match);
  if (p.length) h += `<h5>${esc(t('popular'))}</h5>` + p.map(btn).join('');
  if (r.length) h += `<h5>${esc(t('allCur'))}</h5>` + r.map(btn).join('');
  $('#curList').innerHTML = h;
}

/* ---------------- guide ---------------- */
let gStep = 0;
function showGuide(i = 0) {
  gStep = i; const keys = [['📋', 'g1T', 'g1'], ['🌙', 'g2T', 'g2'], ['🎁', 'g3T', 'g3']]; const [e, a, b] = keys[i];
  $('#guide').innerHTML = `<div class="gcard" role="dialog" aria-modal="true"><div class="gemo">${e}</div><h3>${esc(t(a))}</h3><p>${esc(t(b))}</p>
<div class="gdots">${keys.map((_, j) => `<i class="${j === i ? 'on' : ''}"></i>`).join('')}</div>
<div class="gbtns"><button class="btn" data-act="gskip">${esc(t('skip'))}</button><button class="btn pri" data-act="gnext">${esc(i < 2 ? t('next') : t('start'))}</button></div></div>`;
  $('#guide').classList.add('on');
}
function endGuide() { $('#guide').classList.remove('on'); st.seenGuide = 1; persist(); }

/* ---------------- routing / render all ---------------- */
function route() {
  const id = page();
  $$('main .page').forEach(s => s.classList.toggle('on', s.id === id));
  $$('[data-tab]').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + id));
  $('#hero').hidden = id !== 'list';
  if (DATA) renderResult();
}
function renderAll() {
  VC = new Map(); renderChrome(); if (!DATA) return;
  renderList(); renderPack(); renderHelp();
  if (sheetKind === 'settings') openSettings(); else if (sheetKind === 'info') openProfInfo(); else if (sheetKind.startsWith('item:')) openItem(sheetKind.slice(5));
}

/* ---------------- events ---------------- */
const setOpen = (c, list) => { st.open[c] = list; persist(); renderList(); };
const ACT = {
  open: el => openItem(el.dataset.k),
  fav: el => { const k = el.dataset.k; if (fav[k]) { delete fav[k]; toast(t('favRemoved')); } else { fav[k] = 1; toast(t('favAdded')); } persist(); renderList(); if (sheetKind.startsWith('item:')) openItem(k); },
  add: el => addToPack(el.dataset.k, +(el.dataset.q || 1)),
  addq: el => { const q = Math.max(1, parseInt($('#dq').value) || 1); addToPack(el.dataset.k, q); },
  dq: el => { const i = $('#dq'); i.value = Math.max(1, (parseInt(i.value) || 1) + +el.dataset.v); },
  cat: el => { st.cat = el.dataset.v; $('#q').value = ''; persist(); renderList(); },
  grp: el => {
    const c = st.cat, gs = groupsOf(c), g = el.dataset.v;
    const cur = gs.filter(x => isOpen(c, x.g, gs)).map(x => x.g);
    setOpen(c, cur.includes(g) ? cur.filter(x => x !== g) : [...cur, g]);
  },
  openAll: () => setOpen(st.cat, groupsOf(st.cat).map(x => x.g)),
  closeAll: () => setOpen(st.cat, []),
  more: el => { const k = el.dataset.v; SHOWN.set(k, (SHOWN.get(k) || (k.includes('|') ? (st.view === 'table' ? 20 : PAGE) : 60)) + (k.includes('|') ? MORE : 60)); renderList(); },
  view: el => { st.view = el.dataset.v; st.viewManual = 1; persist(); renderList(); },
  qclear: () => { $('#q').value = ''; renderList(); $('#q').focus(); },
  prof: el => { st.prof = el.dataset.v; persist(); renderAll(); },
  profinfo: () => openProfInfo(),
  daily: el => { st.dailyAP = +el.dataset.v; persist(); renderAll(); },
  need: el => { const p = pack.items[+el.dataset.i]; if (!p) return; p.off = p.off ? 0 : 1; persist(); renderPack(); },
  toTop: () => { const r = $('#ratCard'); if (r) r.scrollIntoView({behavior: 'smooth', block: 'start'}); },
  close: () => closeSheet(),
  settings: () => openSettings(),
  lang: () => openLang(),
  setLang: el => { st.lang = el.dataset.v; dn = null; if (!st.curManual) st.cur = DEF_CUR[st.lang]; persist(); closeSheet(); renderAll(); },
  curpick: el => openCur(el.dataset.v),
  setCur: el => {
    const v = el.dataset.v;
    if (curTarget === 'price') { pack.cur = v; persist(); closeSheet(); renderPack(); return; }
    if (curTarget === 'cur') { st.cur = v; st.curManual = true; }
    else if (curTarget === 'cCur') st.cCur = v || 'twd';
    else st[curTarget] = v;
    persist(); closeSheet(); renderAll();
    if (curFrom === 'settings') openSettings();
  },
  set: el => { const k = el.dataset.k; let v = el.dataset.v; if (k === 'region' || k === 'camp') v = +v; if (k === 'view') st.viewManual = 1; st[k] = v; persist(); renderAll(); },
  apP: el => { st.apRate = +el.dataset.v; persist(); renderAll(); },
  clearCustom: () => { for (const k in custom) delete custom[k]; persist(); renderAll(); toast(t('resetT')); },
  clearFav: () => { for (const k in fav) delete fav[k]; persist(); renderAll(); toast(t('resetT')); },
  resetAll: () => { Object.assign(st, {cur: DEF_CUR[st.lang], curManual: false, cur2: '', cat: 'cur', sort: 0, view: innerWidth >= 1024 ? 'table' : 'list', viewManual: 0, theme: 'auto', fs: 'm', cols: {pyro:1, ap:0, method:1, meta:1, demand:0}, open: {}, ...DEF, seenGuide: 1}); persist(); renderAll(); toast(t('resetT')); },
  guide: () => { closeSheet(); showGuide(0); },
  gnext: () => gStep < 2 ? showGuide(gStep + 1) : endGuide(),
  gskip: () => endGuide(),
  cclear: el => { delete custom[el.dataset.k]; persist(); renderList(); renderPack(); openItem(el.dataset.k); },
  pq: el => { const i = +el.dataset.i; const p = pack.items[i]; if (!p) return; p.q = Math.max(0, p.q + +el.dataset.v); persist(); renderPack(); },
  rm: el => { pack.items.splice(+el.dataset.i, 1); persist(); renderPack(); renderChrome(); },
  pcur: () => openCur('price'),
  save: () => { const name = $('#pName').value.trim() || ('#' + (saved.list.length + 1)); pack.name = name; saved.list.unshift({name, items: pack.items.map(x => ({...x})), price: pack.price, cur: pack.cur || st.cur, date: Date.now()}); saved.list = saved.list.slice(0, 30); persist(); renderSaved(); toast(t('savedT')); },
  sload: el => { const s = saved.list[+el.dataset.i]; if (!s) return; pack.items = s.items.map(x => ({...x})); pack.price = s.price; pack.cur = s.cur; pack.name = s.name; persist(); renderPack(); renderChrome(); scrollTo({top: 0, behavior: 'smooth'}); },
  sdel: el => { saved.list.splice(+el.dataset.i, 1); persist(); renderSaved(); },
  copy: async () => { try { await navigator.clipboard.writeText(copyText()); toast(t('copied')); } catch (e) { openSheet(`<div class="shh"><div class="sht"><h3>${esc(t('copy'))}</h3></div><button class="x" data-act="close" aria-label="close">✕</button></div><textarea class="copybox" readonly>${esc(copyText())}</textarea>`, 'copy'); } },
  clearPack: () => { pack.items = []; pack.price = ''; pack.name = ''; pack.cur = ''; persist(); renderPack(); renderChrome(); },
  pickadd: el => { addToPack(el.dataset.k, 1); $('#ps').value = ''; $('#pres').innerHTML = ''; },
};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  if (el.tagName === 'A') return;
  const f = ACT[el.dataset.act]; if (f) { e.preventDefault(); f(el, e); }
});
let qT = 0;
document.addEventListener('input', e => {
  const el = e.target;
  if (el.id === 'q') { clearTimeout(qT); qT = setTimeout(renderList, 120); return; }
  if (el.id === 'curQ') return renderCurList(curTarget === 'price' ? (pack.cur || st.cur) : st[curTarget]);
  if (el.id === 'pPrice') { pack.price = el.value; if (!pack.cur && el.value) pack.cur = st.cur; persist(); return renderResult(); }  // pin the currency the price was typed in
  if (el.id === 'pName') { pack.name = el.value; persist(); return; }
  if (el.id === 'ps') return renderPS();
  const k = el.dataset.in; if (!k) return;
  if (k === 'pq') { const p = pack.items[+el.dataset.i]; if (p) { p.q = Math.max(0, parseInt(el.value) || 0); persist(); renderResult(); } }
});
document.addEventListener('change', e => {
  const el = e.target, k = el.dataset.in; if (!k) return;
  const num = (v, d) => { const x = parseFloat(v); return isFinite(x) && x >= 0 ? x : d; };
  if (k === 'sort') { st.sort = +el.value; persist(); return renderList(); }
  if (k === 'col') { st.cols[el.dataset.k] = el.checked ? 1 : 0; persist(); renderList(); return; }
  if (k === 'pq') { const p = pack.items[+el.dataset.i]; if (p) el.value = p.q; renderPack(); return; }
  if (k === 'dailyAP') { st.dailyAP = Math.max(1, Math.round(num(el.value, DEF.dailyAP))) || DEF.dailyAP; }
  if (k === 'apRate') { const x = num(el.value, DEF.apRate); st.apRate = x > 0 ? x : DEF.apRate; }
  if (k === 'cAmt') { st.cAmt = num(el.value, DEF.cAmt) || DEF.cAmt; }
  if (k === 'cPrice') { st.cPrice = num(el.value, DEF.cPrice); }
  persist(); renderAll();
});
document.addEventListener('submit', e => {
  const f = e.target.closest('form.cust'); if (!f) return; e.preventDefault();
  const k = f.dataset.k, v = parseFloat($('#cv').value), c = isF2P() ? cpp(st.cur, 'lite') : cpp();
  if (isFinite(v) && v >= 0 && c) custom[k] = v / c; else delete custom[k];
  persist(); renderList(); renderPack(); openItem(k);
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { if ($('#guide').classList.contains('on')) endGuide(); else closeSheet(); return; }
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('[data-act=open]')) { e.preventDefault(); openItem(e.target.dataset.k); }
});
$('#sheetWrap .backdrop').addEventListener('click', closeSheet);
addEventListener('hashchange', () => { route(); scrollTo(0, 0); });
function renderPS() {
  const q = $('#ps').value.trim().toLowerCase();
  $('#pres').innerHTML = q ? DATA.items.filter(it => inRegion(it) && it.s.includes(q)).slice(0, 8).map(it => {
    const v = val(it);
    return `<button data-act="pickadd" data-k="${it.k}"><span class="av sm r${it.r || 1}">${icon(it)}</span><span class="mid"><b>${esc(nm(it))}</b><small>${esc(catLabel(it.c))}</small></span><span>${v ? esc(mainPrice(v.p * unitOf(it))) : ''}</span></button>`;
  }).join('') : '';
}

/* ---------------- exchange rates ---------------- */
async function loadFx() {
  try {
    const m = await import(FX_URL + '?h=' + Math.floor(Date.now() / 36e5));
    const d = m.default || m;
    if (d && d.usd && d.usd.twd) { const ch = d.date !== FX.date || !FX.live; FX = {date: d.date, usd: d.usd, live: true}; if (ch) renderAll(); return; }
  } catch (e) {}
  if (!FX.date && DATA) { FX = {date: DATA.fx.date, usd: DATA.fx.usd, live: false}; renderAll(); }
}

/* ---------------- boot ---------------- */
if (!st.cur) st.cur = DEF_CUR[st.lang];
if (!PROFS.includes(st.prof) && st.prof !== 'custom') st.prof = DEF.prof;
if (!st.viewManual && window.innerWidth >= 1024) st.view = 'table';
if (!st.open || typeof st.open !== 'object') st.open = {};
applyLook(); route(); renderChrome();
try {
  const r = await fetch('data.json'); DATA = await r.json();
  DATA.items.forEach((it, i) => { it.s = it.n.join(' ').toLowerCase(); it.i = i; BYK[it.k] = it; });
  DATA.meta.events = DATA.meta.events || {};
  FX = {date: DATA.fx.date, usd: DATA.fx.usd, live: false};
  if (!CORDER.hasOwnProperty(st.cat) && st.cat !== 'fav') st.cat = 'cur';
  $('#loading').remove(); renderAll(); route();
  if (!st.seenGuide) showGuide(0);
} catch (e) { $('#loading').textContent = 'Data load failed: ' + e.message; }
loadFx(); setInterval(loadFx, 36e5);
