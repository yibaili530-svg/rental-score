// 租房评分数据层：所有数据存于 localStorage，每次操作读取-修改-写回
const KEY = 'rentscore.v1';

const DEFAULT_ITEMS = [
  ['i_loc', '位置', 1], ['i_traffic', '交通便利', 1], ['i_env', '周边环境', 1],
  ['i_room', '房间大小', 1], ['i_share', '合租条件', 1], ['i_bath', '卫生间', 1],
  ['i_light', '光照', 1], ['i_deco', '装修', 1], ['i_video', '能拍视频', 2],
  ['i_sublet', '转租灵活', 1], ['i_price', '价格', 2], ['i_safe', '安全', 1],
  ['i_noise', '噪音', 1], ['i_landlord', '房东/中介靠谱', 1], ['i_hidden', '隐性费用', 1],
  ['i_appl', '家电家具', 1], ['i_kitchen', '厨房', 1], ['i_contract', '合同和押金', 1],
  ['i_damp', '通风和潮湿', 1],
].map(([id, name, max]) => ({ id, name, max }));

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const normMax = v => {
  const n = Number(v);
  return Math.max(0.5, Math.round((Number.isFinite(n) ? n : 1) * 2) / 2);
};
const snapScore = (v, max) => clamp(Math.round(Number(v) * 2) / 2, 0, max);
const emptyData = () => ({ version: 1, items: DEFAULT_ITEMS.map(x => ({ ...x })), props: [] });

export const uid = () => Math.random().toString(36).slice(2, 10);

export function load() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY));
    if (d && d.version === 1 && Array.isArray(d.items) && Array.isArray(d.props)) return d;
  } catch {}
  return emptyData();
}

export function save(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    if (e && e.name === 'QuotaExceededError') return false;
    throw e;
  }
}

// 评分项：分数按 item id 存，改名/改满分不影响已有分数
export function addItem(name, max = 1) {
  const d = load();
  const id = 'i_' + uid();
  d.items.push({ id, name: String(name).trim(), max: normMax(max) });
  return save(d) ? id : null;
}

export function renameItem(id, name) {
  const d = load();
  const it = d.items.find(x => x.id === id);
  const n = String(name).trim();
  if (!it || !n) return false;
  it.name = n;
  return save(d);
}

export function setItemMax(id, max) {
  const d = load();
  const it = d.items.find(x => x.id === id);
  if (!it) return false;
  it.max = normMax(max);
  const now = Date.now();
  for (const p of d.props) {
    if (p.scores && typeof p.scores[id] === 'number' && p.scores[id] > it.max) {
      p.scores[id] = it.max;
      p.updatedAt = now;
    }
  }
  return save(d);
}

// 删除仅从 items 移除，props.scores 中保留，计算时忽略
export function deleteItem(id) {
  const d = load();
  d.items = d.items.filter(x => x.id !== id);
  return save(d);
}

export function moveItem(id, dir) {
  const d = load();
  const i = d.items.findIndex(x => x.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= d.items.length) return false;
  [d.items[i], d.items[j]] = [d.items[j], d.items[i]];
  return save(d);
}

export function resetItems() {
  const d = load();
  d.items = DEFAULT_ITEMS.map(x => ({ ...x }));
  const max = new Map(d.items.map(i => [i.id, i.max]));
  for (const p of d.props) {
    for (const [id, s] of Object.entries(p.scores || {})) {
      if (max.has(id)) p.scores[id] = clamp(s, 0, max.get(id));
    }
  }
  return save(d);
}

// 计算
export function totalOf(prop, items) {
  let t = 0;
  for (const it of items) {
    const s = prop.scores?.[it.id];
    if (typeof s === 'number') t += clamp(s, 0, it.max);
  }
  return t;
}

export const maxTotal = items => items.reduce((a, x) => a + x.max, 0);

export function rateOf(prop, items) {
  const m = maxTotal(items);
  return m ? totalOf(prop, items) / m : 0;
}

export const scoredCount = (prop, items) =>
  items.filter(it => typeof prop.scores?.[it.id] === 'number').length;

export function setScore(propId, itemId, v) {
  const d = load();
  const p = d.props.find(x => x.id === propId);
  const it = d.items.find(x => x.id === itemId);
  if (!p || !it) return false;
  p.scores ??= {};
  if (v == null || v === '') delete p.scores[itemId];
  else p.scores[itemId] = snapScore(v, it.max);
  p.updatedAt = Date.now();
  return save(d);
}

// 房源 CRUD
export function addProp(fields = {}) {
  const d = load();
  const now = Date.now();
  const id = uid();
  d.props.push({
    name: '', url: '', address: '', rent: 0, date: '', note: '', photos: [], scores: {},
    ...fields, id, createdAt: now, updatedAt: now,
  });
  return save(d) ? id : null;
}

export function updateProp(id, patch) {
  const d = load();
  const p = d.props.find(x => x.id === id);
  if (!p) return false;
  Object.assign(p, patch, { id, updatedAt: Date.now() });
  return save(d);
}

export function deleteProp(id) {
  const d = load();
  d.props = d.props.filter(x => x.id !== id);
  return save(d);
}

export function getProp(id) {
  return load().props.find(x => x.id === id);
}

export function ranked() {
  const { items, props } = load();
  return props
    .map(p => ({ p, rate: rateOf(p, items), total: totalOf(p, items) }))
    .sort((a, b) => b.rate - a.rate || b.total - a.total)
    .map(x => x.p);
}

// 导入导出
export function exportJSON() {
  return JSON.stringify(load(), null, 2);
}

function validate(d) {
  if (!d || d.version !== 1 || !Array.isArray(d.items) || !Array.isArray(d.props)) {
    throw new Error('数据格式不正确');
  }
  const items = d.items.map(x => {
    if (typeof x?.id !== 'string' || typeof x.name !== 'string') throw new Error('评分项格式不正确');
    return { id: x.id, name: x.name, max: normMax(x.max) };
  });
  const props = d.props.map(p => {
    if (typeof p?.id !== 'string') throw new Error('房源格式不正确');
    return {
      ...p,
      photos: Array.isArray(p.photos) ? p.photos : [],
      scores: p.scores && typeof p.scores === 'object' ? p.scores : {},
    };
  });
  return { version: 1, items, props };
}

// mode: 'replace' 整体替换；'merge' 按 id 合并（评分项以导入为准，房源取 updatedAt 较新者）
export function importJSON(text, mode = 'replace') {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('无法解析 JSON');
  }
  const incoming = validate(parsed);
  if (mode === 'merge') {
    const d = load();
    const items = new Map(d.items.map(x => [x.id, x]));
    for (const x of incoming.items) items.set(x.id, { ...items.get(x.id), ...x });
    const props = new Map(d.props.map(p => [p.id, p]));
    for (const p of incoming.props) {
      const old = props.get(p.id);
      if (!old || (p.updatedAt || 0) >= (old.updatedAt || 0)) props.set(p.id, p);
    }
    return save({ version: 1, items: [...items.values()], props: [...props.values()] });
  }
  return save(incoming);
}

const csvCell = v => {
  const s = String(v ?? '');
  return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};

export function exportCSV() {
  const { items, props } = load();
  const head = ['名称', '链接', '地址', '月租', '看房日期', '备注',
    ...items.map(i => `${i.name}/${i.max}`), '总分', '满分', '得分率%'];
  const rows = props.map(p => {
    const total = totalOf(p, items);
    const max = maxTotal(items);
    return [p.name, p.url, p.address, p.rent, p.date, p.note,
      ...items.map(i => (typeof p.scores?.[i.id] === 'number' ? p.scores[i.id] : '')),
      total, max, max ? (total / max * 100).toFixed(1) : '0.0'];
  });
  return '﻿' + [head, ...rows].map(r => r.map(csvCell).join(',')).join('\r\n');
}

function parseCSV(text) {
  const rows = [];
  let row = [], f = '', q = false;
  text = text.replace(/^﻿/, '');
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') {
        if (text[i + 1] === '"') { f += '"'; i++; } else q = false;
      } else f += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(f); f = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(f); rows.push(row); row = []; f = '';
    } else f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  return rows.filter(r => r.some(x => x !== ''));
}

const FIXED_COLS = ['名称', '链接', '地址', '月租', '看房日期', '备注'];
const TAIL_COLS = ['总分', '满分', '得分率%'];

// 返回导入的房源数量
export function importCSV(text) {
  const [head, ...body] = parseCSV(text);
  if (!head) throw new Error('CSV 为空');
  const d = load();

  // 评分列：按"项名/满分"解析，未知项自动新增
  const itemCols = [];
  head.forEach((h, idx) => {
    if (FIXED_COLS.includes(h) || TAIL_COLS.includes(h)) return;
    const cut = h.lastIndexOf('/');
    const name = (cut > 0 ? h.slice(0, cut) : h).trim();
    const max = cut > 0 ? h.slice(cut + 1) : 1;
    let it = d.items.find(x => x.name === name);
    if (!it) {
      it = { id: 'i_' + uid(), name, max: normMax(max) };
      d.items.push(it);
    }
    itemCols.push({ idx, item: it });
  });

  const now = Date.now();
  for (const r of body) {
    const get = name => {
      const i = head.indexOf(name);
      return i < 0 ? '' : (r[i] ?? '');
    };
    const scores = {};
    for (const { idx, item } of itemCols) {
      const v = r[idx];
      if (v != null && v.trim() !== '' && Number.isFinite(Number(v))) {
        scores[item.id] = snapScore(v, item.max);
      }
    }
    d.props.push({
      id: uid(),
      name: get('名称'), url: get('链接'), address: get('地址'),
      rent: Number(get('月租')) || 0, date: get('看房日期'), note: get('备注'),
      photos: [], scores, createdAt: now, updatedAt: now,
    });
  }
  if (!save(d)) throw new Error('存储空间不足');
  return body.length;
}

// 图片压缩
export function compressImage(file, maxSide = 1024, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const k = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement('canvas');
      c.width = Math.round(img.naturalWidth * k);
      c.height = Math.round(img.naturalHeight * k);
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#fff'; // JPEG 无透明通道，避免黑底
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('图片读取失败'));
    };
    img.src = url;
  });
}

// 低分暖灰 → 高分深橙，同一色相系
export function rateColor(rate) {
  const r = clamp(Number(rate) || 0, 0, 1);
  return `hsl(${Math.round(30 - 6 * r)},${Math.round(55 + 45 * r)}%,${Math.round(68 - 16 * r)}%)`;
}
