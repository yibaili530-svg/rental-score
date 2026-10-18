import * as S from './store.js';
import { renderRank, renderCompare, renderItems, openSettings, openExport, triggerImport } from './views.js';
import { IC, ITEM_ICONS, itemIcon, EMPTY_ART, KEY_MOTIF } from './icons.js';

const $ = (sel, root = document) => root.querySelector(sel);
const view = $('#view');
const fab = $('#fab');
const sheet = $('#sheet');
const toastEl = $('#toast');
const state = { tab: 'list', id: null };
const celebrated = new Set();
let pend = null, pendT = 0;

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const fmt = n => Number(n).toFixed(1).replace(/\.0$/, '');
const pctOf = rate => Math.round(rate * 100);
const isScored = (p, it) => typeof p.scores?.[it.id] === 'number';

function ringSVG(rate, size, stroke) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, mid = size / 2;
  return `<svg viewBox="0 0 ${size} ${size}"><circle class="track" cx="${mid}" cy="${mid}" r="${r}" stroke-width="${stroke}"/><circle class="ring-fg" cx="${mid}" cy="${mid}" r="${r}" stroke-width="${stroke}" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - rate)}"/></svg>`;
}

function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastEl._t);
  toastEl._t = setTimeout(() => toastEl.classList.remove('show'), 1600);
}

function openSheet(html, onMount) {
  const body = sheet.querySelector('.sheet-body');
  body.innerHTML = html;
  if (!sheet.open) sheet.showModal();
  onMount?.(body);
}

function closeSheet() {
  sheet.close();
}

sheet.addEventListener('click', e => { if (e.target === sheet) closeSheet(); });

function queue(k, v) {
  if (!pend) pend = { id: state.id, patch: {} };
  pend.patch[k] = v;
  clearTimeout(pendT);
  pendT = setTimeout(flush, 400);
}

function flush() {
  clearTimeout(pendT);
  if (!pend) return;
  const { id, patch } = pend;
  pend = null;
  if (!S.updateProp(id, patch)) toast('存储空间不足');
}

function go(tab, arg) {
  flush();
  state.tab = tab;
  if (tab === 'score') state.id = arg;
  state.arg = arg ?? null;
  history.replaceState(null, '', tab === 'score' ? `#score/${arg}` : `#${tab}`);
  window.scrollTo(0, 0);
  render();
}

function render() {
  const tab = state.tab === 'score' ? 'list' : state.tab;
  document.querySelectorAll('.tab').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
  fab.classList.toggle('hidden', !['list', 'rank'].includes(state.tab));
  if (state.tab === 'list') renderList(view);
  else if (state.tab === 'score') renderScore(view);
  else if (state.tab === 'rank') renderRank(ctx, view);
  else if (state.tab === 'compare') { renderCompare(ctx, view, state.arg); state.arg = null; }
  else if (state.tab === 'items') renderItems(ctx, view);
}

function toolbar(n) {
  return `<div class="toolbar"><span class="count-pill"><span class="ico">${IC.home}</span>${n}</span><button class="pill-btn" data-act="compare"><span class="ico">${IC.compare}</span>对比</button></div>`;
}

function meta2(p) {
  return `<div class="meta2"><span class="ad">${p.address ? `<span class="mi">${ITEM_ICONS.i_loc}</span><span class="addr">${esc(p.address)}</span>` : ''}</span>` +
    `<span class="cnt"><span class="mi">${IC.photo}</span>${p.photos?.length || 0}</span>${p.url ? `<span class="mi">${IC.link}</span>` : ''}</div>`;
}

function renderList(v) {
  const { items, props } = S.load();
  if (!props.length) {
    v.innerHTML = `<div class="empty"><div class="empty-art">${EMPTY_ART}</div><div class="empty-actions"><button class="btn primary" data-act="add"><span class="ico">${IC.plus}</span>添加房源</button><button class="btn" data-act="import"><span class="ico">${IC.import}</span>导入</button></div></div>`;
    return;
  }
  v.innerHTML = toolbar(props.length) + props.map(p => {
    const rate = S.rateOf(p, items);
    const meta = [p.rent ? `<span class="rent">¥${esc(p.rent)}</span>` : '', p.date ? `<span>${esc(p.date)}</span>` : ''].filter(Boolean).join('<span class="sep">·</span>');
    return `<button class="card" data-id="${p.id}"><div class="thumb">${p.photos?.[0] ? '' : `<span class="ico">${IC.home}</span>`}</div>` +
      `<div class="info"><div class="name">${esc(p.name || '未命名')}</div><div class="meta">${meta}</div>${meta2(p)}</div>` +
      `<div class="mini-ring" style="--rate-color:${S.rateColor(rate)}">${ringSVG(rate, 52, 5)}<b class="${pctOf(rate) >= 100 ? 'wide' : ''}">${pctOf(rate)}%</b></div></button>`;
  }).join('');
  v.querySelectorAll('.thumb').forEach((el, i) => {
    const src = props[i].photos?.[0];
    if (src) el.style.backgroundImage = `url("${src}")`;
  });
}

function itemRow(p, it) {
  const cur = p.scores?.[it.id];
  const n = Math.round(it.max * 2);
  let steps = '';
  for (let k = 0; k <= n; k++) {
    const x = k / 2;
    steps += `<button class="step${cur === x ? ' on' : ''}" data-item="${it.id}" data-v="${x}">${fmt(x)}</button>`;
  }
  return `<div class="item" data-row="${it.id}"><div class="item-name"><span class="ico">${itemIcon(it.id)}</span>${esc(it.name)}<span class="item-max">/${fmt(it.max)}</span></div><div class="steps">${steps}</div></div>`;
}

function field(k, label, val, attrs = '', icon = '') {
  return `<div class="field"><span class="lbl">${icon ? `<span class="mi">${icon}</span>` : ''}${label}</span><input data-f="${k}" ${attrs} value="${esc(val)}"></div>`;
}

function photoActions() {
  return `<button class="add-photo" data-act="cam" aria-label="拍照"><span class="ico">${IC.camera}</span><small>拍照</small></button>` +
    `<button class="add-photo" data-act="pick" aria-label="相册"><span class="ico">${IC.gallery}</span><small>相册</small></button>`;
}

function photoThumbs(p) {
  return (p.photos || []).map((src, i) =>
    `<div class="ph"><img src="${src}" alt=""><button class="ph-del" data-act="pdel" data-idx="${i}" aria-label="删除">×</button></div>`
  ).join('');
}

function refreshPhotos() {
  const el = document.getElementById('photos');
  const p = S.getProp(state.id);
  if (el && p) el.innerHTML = photoThumbs(p);
  const pb = document.querySelector('[data-jump="sec-photos"]');
  if (pb && p) pb.lastChild.textContent = `照片 ${p.photos.length}`;
  updateHeroBg(p);
}

function updateHeroBg(p) {
  const hero = document.querySelector('.score-view .hero');
  if (!hero) return;
  const src = p?.photos?.[0];
  hero.classList.toggle('has-photo', !!src);
  let bg = hero.querySelector('.hero-bg');
  if (!src) {
    bg?.remove();
    hero.querySelector('.hero-veil')?.remove();
    return;
  }
  if (!bg) {
    hero.insertAdjacentHTML('afterbegin', '<img class="hero-bg" alt=""><div class="hero-veil"></div>');
    bg = hero.querySelector('.hero-bg');
  }
  if (bg.getAttribute('src') !== src) bg.src = src;
}

function renderScore(v) {
  const p = S.getProp(state.id);
  if (!p) return go('list');
  const { items } = S.load();
  const rate = S.rateOf(p, items), total = S.totalOf(p, items), max = S.maxTotal(items);
  v.innerHTML = `
  <section class="score-view" style="--rate-color:${S.rateColor(rate)}">
    <div class="hero">
      <div class="hname">${esc(p.name || '未命名')}</div>
      <div class="ring">${ringSVG(rate, 200, 14)}
        <div class="center"><div class="total">${fmt(total)}</div><div class="of">/${fmt(max)}</div><div class="pct">${pctOf(rate)}%</div></div>
      </div>
      <div class="stars-sum">${items.map(it => `<i class="${isScored(p, it) ? 'on' : ''}"></i>`).join('')}</div>
    </div>
    <div class="jump">
      <button class="pill-btn" data-jump="sec-info"><span class="ico">${IC.info}</span>信息</button>
      <button class="pill-btn" data-jump="sec-photos"><span class="ico">${IC.photo}</span>照片 ${(p.photos || []).length}</button>
      <button class="pill-btn" data-act="compare-this"><span class="ico">${IC.compare}</span>对比</button>
    </div>
    <div class="sec-title" id="sec-score"><span class="ico">${IC.items}</span>评分</div>
    <div class="items">${items.map(it => itemRow(p, it)).join('')}</div>
    <div class="sec-title" id="sec-info"><span class="ico">${IC.info}</span>房源信息</div>
    <div class="fields">
      ${field('name', '名称', p.name, 'type="text"', IC.home)}
      <div class="field"><span class="lbl"><span class="mi">${IC.link}</span>链接 <a id="lnk" class="${p.url ? '' : 'hidden'}" href="${esc(p.url)}" target="_blank" rel="noopener" style="color:var(--brand)">↗</a></span><input data-f="url" type="url" value="${esc(p.url)}"></div>
      ${field('address', '地址', p.address, 'type="text"', ITEM_ICONS.i_loc)}
      <div class="pair">
        ${field('rent', '月租', p.rent || '', 'type="number" inputmode="decimal"', ITEM_ICONS.i_price)}
        ${field('date', '看房日期', p.date, 'type="date"', IC.calendar)}
      </div>
      <div class="field"><span class="lbl"><span class="mi">${ITEM_ICONS.i_contract}</span>备注</span><textarea data-f="note" rows="2">${esc(p.note)}</textarea></div>
    </div>
    <div class="sec-title" id="sec-photos"><span class="ico">${IC.photo}</span>照片</div>
    <div class="photo-actions">${photoActions()}</div>
    <div id="photos" class="photos">${photoThumbs(p)}</div>
    <button class="btn danger btn-block" data-act="del" style="margin-top:22px">删除房源</button>
  </section>`;
  updateHeroBg(p);
}

function onStep(btn) {
  const id = state.id, itemId = btn.dataset.item, v = Number(btn.dataset.v);
  const p = S.getProp(id);
  if (!p) return;
  const cur = p.scores?.[itemId];
  const next = cur === v ? null : v;
  if (!S.setScore(id, itemId, next)) return toast('存储空间不足');

  const { items } = S.load();
  const p2 = S.getProp(id);
  const rate = S.rateOf(p2, items), total = S.totalOf(p2, items);
  const sv = view.querySelector('.score-view');
  sv.style.setProperty('--rate-color', S.rateColor(rate));
  view.querySelectorAll(`[data-row="${itemId}"] .step`).forEach(b =>
    b.classList.toggle('on', next !== null && Number(b.dataset.v) === next));

  const fg = sv.querySelector('.ring .ring-fg');
  fg.style.strokeDashoffset = parseFloat(fg.getAttribute('stroke-dasharray')) * (1 - rate);

  const t = sv.querySelector('.total');
  t.textContent = fmt(total);
  t.classList.remove('pop');
  void t.offsetWidth;
  t.classList.add('pop');
  t.addEventListener('animationend', () => t.classList.remove('pop'), { once: true });

  sv.querySelector('.pct').textContent = pctOf(rate) + '%';
  sv.querySelectorAll('.stars-sum i').forEach((d, i) => d.classList.toggle('on', isScored(p2, items[i])));

  if (rate >= 0.85 && !celebrated.has(id)) {
    celebrated.add(id);
    confetti();
  }
}

function confetti() {
  const box = document.createElement('div');
  box.className = 'confetti';
  const colors = ['#ff7a1a', '#ffb067', '#f2d38a', '#9cc5a1', '#8fb3d9'];
  for (let k = 0; k < 20; k++) {
    const i = document.createElement('i');
    i.style.setProperty('--x', Math.random() * 100 + '%');
    i.style.setProperty('--c', colors[k % colors.length]);
    i.style.setProperty('--d', (1.4 + Math.random() * 0.8) + 's');
    i.style.animationDelay = Math.random() * 0.4 + 's';
    box.append(i);
  }
  document.body.append(box);
  setTimeout(() => box.remove(), 2000);
}

async function addPhotos(files) {
  const id = state.id;
  const p = S.getProp(id);
  if (!p) return;
  const photos = [...(p.photos || [])];
  try {
    for (const f of files) photos.push(await S.compressImage(f, 1024, 0.72));
  } catch {
    toast('图片读取失败');
  }
  if (!S.updateProp(id, { photos })) return toast('存储空间不足');
  if (state.tab === 'score' && state.id === id) refreshPhotos();
}

function delPhoto(idx) {
  const p = S.getProp(state.id);
  if (!p) return;
  const photos = p.photos.filter((_, i) => i !== idx);
  if (!S.updateProp(state.id, { photos })) return toast('存储空间不足');
  refreshPhotos();
}

function delProp() {
  if (!confirm('删除这个房源？')) return;
  flush();
  S.deleteProp(state.id);
  go('list');
}

function addNew() {
  const id = S.addProp({ name: '房源 ' + (S.load().props.length + 1) });
  if (id) go('score', id);
  else toast('存储空间不足');
}

const ctx = { S, $, toast, openSheet, closeSheet, go, render, ringSVG, fmt, esc };

const doImport = () => triggerImport(ctx);

view.addEventListener('click', e => {
  const t = e.target;
  const card = t.closest('.card[data-id]');
  if (card) return go('score', card.dataset.id);
  const step = t.closest('.step[data-item]');
  if (step && state.tab === 'score') return onStep(step);
  const img = t.closest('.ph img');
  if (img && state.tab === 'score') {
    return openSheet(`<img src="${img.src}" alt="" style="width:100%;border-radius:20px">`);
  }
  const jump = t.closest('[data-jump]');
  if (jump && state.tab === 'score') {
    return document.getElementById(jump.dataset.jump).scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  const btn = t.closest('[data-act]');
  if (!btn) return;
  switch (btn.dataset.act) {
    case 'add': return addNew();
    case 'import': return doImport();
    case 'compare': return go('compare');
    case 'compare-this': return go('compare', state.id);
    case 'cam': return $('#file-camera').click();
    case 'pick': return $('#file-photo').click();
    case 'pdel': return delPhoto(Number(btn.dataset.idx));
    case 'del': return delProp();
  }
});

view.addEventListener('input', e => {
  const el = e.target, k = el.dataset.f;
  if (!k || state.tab !== 'score') return;
  if (k === 'name') {
    const t = $('.hname');
    if (t) t.textContent = el.value || '未命名';
  }
  if (k === 'url') {
    const a = $('#lnk');
    a.href = el.value || '#';
    a.classList.toggle('hidden', !el.value);
  }
  queue(k, k === 'rent' ? Number(el.value) || 0 : el.value);
});

view.addEventListener('focusout', flush);

for (const id of ['file-camera', 'file-photo']) {
  $('#' + id).addEventListener('change', e => {
    const input = e.target;
    const files = [...input.files];
    input.value = '';
    if (files.length) addPhotos(files);
  });
}

$('.tabbar').addEventListener('click', e => {
  const b = e.target.closest('.tab');
  if (b) go(b.dataset.tab);
});
fab.addEventListener('click', addNew);
const TAB_ICONS = { list: IC.list, rank: IC.rank, compare: IC.compare, items: IC.items };
document.querySelectorAll('.tab').forEach(b => { b.querySelector('.ti').innerHTML = TAB_ICONS[b.dataset.tab]; });
document.querySelector('.logo').innerHTML = IC.home;
document.querySelector('.key-motif').innerHTML = KEY_MOTIF;
$('#btn-import').innerHTML = `${IC.import}导入`;
$('#btn-export').innerHTML = `${IC.export}导出`;
$('#btn-settings').innerHTML = IC.settings;
$('#btn-import').addEventListener('click', doImport);
$('#btn-export').addEventListener('click', () => openExport(ctx));
$('#btn-settings').addEventListener('click', () => openSettings(ctx));

const [hashTab, hashId] = location.hash.slice(1).split('/');
if (hashTab === 'score' && S.getProp(hashId)) {
  state.tab = 'score';
  state.id = hashId;
} else if (['rank', 'compare', 'items'].includes(hashTab)) {
  state.tab = hashTab;
}
render();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(err => console.warn('sw 注册失败', err));
}
