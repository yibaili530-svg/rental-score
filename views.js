import { IC, itemIcon, EMPTY_ART } from './icons.js';

const KEY = 'rentscore.v1';

let cmpSel = null;
let ictx = null;
let importBound = false;

const stamp = () => {
  const d = new Date(), p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;
};

function download(name, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function bindImport(ctx) {
  ictx = ctx;
  if (importBound) return;
  importBound = true;
  ctx.$('#file-import').addEventListener('change', onImportFile);
}

export function triggerImport(ctx) {
  bindImport(ctx);
  ctx.$('#file-import').click();
}

export function openExport(ctx) {
  const { S, openSheet, closeSheet } = ctx;
  openSheet(`<div class="export-grid">
      <button class="big-opt" data-e="json">${IC.export}<b>JSON</b></button>
      <button class="big-opt" data-e="csv">${IC.export}<b>CSV</b></button>
    </div>`, body => {
    body.onclick = e => {
      const b = e.target.closest('[data-e]');
      if (!b) return;
      if (b.dataset.e === 'json') download(`rentscore-${stamp()}.json`, S.exportJSON(), 'application/json;charset=utf-8');
      else download(`rentscore-${stamp()}.csv`, S.exportCSV(), 'text/csv;charset=utf-8');
      closeSheet();
    };
  });
}

export function renderRank(ctx, el) {
  const { S, esc, fmt } = ctx;
  const list = S.ranked();
  if (!list.length) {
    el.innerHTML = `<div class="empty"><div class="empty-art">${EMPTY_ART}</div><div class="empty-actions"><button class="btn primary" data-act="add"><span class="ico">${IC.plus}</span>添加房源</button><button class="btn" data-act="import"><span class="ico">${IC.import}</span>导入</button></div></div>`;
    el.onclick = null;
    return;
  }
  const { items } = S.load();
  const max = S.maxTotal(items);
  el.innerHTML = `<div class="toolbar end"><button class="pill-btn" data-act="compare"><span class="ico">${IC.compare}</span>对比</button></div><div class="rank-list">${list.map((p, i) => {
    const total = S.totalOf(p, items), rate = S.rateOf(p, items), pct = Math.round(rate * 100);
    const medal = i < 3
      ? `<div class="medal ${['gold', 'silver', 'bronze'][i]}">${i + 1}</div>`
      : `<div class="medal" style="background:var(--line);color:var(--sub);animation:none">${i + 1}</div>`;
    return `<div class="rank-row" data-id="${p.id}" style="--rate-color:${S.rateColor(rate)}">${medal}` +
      `<div class="info"><div class="name">${esc(p.name || '未命名')}</div><div class="rank-bar"><i style="--w:${pct}%"></i></div></div>` +
      `<div class="rank-score">${pct}%<small style="display:block;font-size:12px;color:var(--sub);font-weight:600">${fmt(total)}/${fmt(max)}</small></div></div>`;
  }).join('')}</div>`;
  el.onclick = e => {
    const row = e.target.closest('.rank-row[data-id]');
    if (row) go('score', row.dataset.id);
  };
}

function cmpTable(ctx, sel, items) {
  const { S, esc, fmt } = ctx;
  const totals = sel.map(p => S.totalOf(p, items));
  const rows = items.map(it => {
    const vals = sel.map(p => p.scores?.[it.id]);
    const scored = vals.filter(v => typeof v === 'number');
    const best = scored.length ? Math.max(...scored) : null;
    const cells = vals.map(v => typeof v === 'number'
      ? `<td class="s${v === best ? ' best' : ''}" style="--cell:${S.rateColor(Math.min(1, v / it.max))}">${fmt(v)}</td>`
      : '<td>–</td>').join('');
    return `<tr><td><span class="ico">${itemIcon(it.id)}</span>${esc(it.name)}<span style="color:var(--sub);font-size:12px"> /${fmt(it.max)}</span></td>${cells}</tr>`;
  }).join('');
  const head = `<tr><th>项目</th>${sel.map(p =>
    `<th><div style="max-width:88px;overflow:hidden;text-overflow:ellipsis">${esc(p.name || '未命名')}</div></th>`).join('')}</tr>`;
  const totalRow = `<tr><td>总分 /${fmt(S.maxTotal(items))}</td>${totals.map(t => `<td>${fmt(t)}</td>`).join('')}</tr>`;
  const rateRow = `<tr><td>得分率</td>${sel.map(p => {
    const r = S.rateOf(p, items);
    return `<td class="s" style="--cell:${S.rateColor(r)}">${Math.round(r * 100)}%</td>`;
  }).join('')}</tr>`;
  return `<div class="cmp-wrap"><table class="cmp"><thead>${head}</thead><tbody>${rows}</tbody><tfoot>${totalRow}${rateRow}</tfoot></table></div>`;
}

export function renderCompare(ctx, el, arg) {
  const { S, esc } = ctx;
  const props = S.ranked();
  if (!props.length) {
    el.innerHTML = `<div class="faint">${IC.compare}</div>`;
    el.onclick = null;
    return;
  }
  if (arg && props.some(p => p.id === arg)) {
    cmpSel = [arg, ...props.slice(0, 2).map(p => p.id).filter(id => id !== arg)].slice(0, 3);
  }
  if (cmpSel === null) cmpSel = props.slice(0, 3).map(p => p.id);
  cmpSel = cmpSel.filter(id => props.some(p => p.id === id));
  const { items } = S.load();
  const sel = props.filter(p => cmpSel.includes(p.id));
  const chips = props.map(p =>
    `<button class="chip${cmpSel.includes(p.id) ? ' on' : ''}" data-cid="${p.id}">${esc(p.name || '未命名')}</button>`).join('');
  const body = sel.length < 2
    ? `<div class="faint">${IC.compare}</div>`
    : cmpTable(ctx, sel, items);
  el.innerHTML = `<div class="chips" style="margin-bottom:4px">${chips}</div>${body}`;
  el.onclick = e => {
    const c = e.target.closest('.chip[data-cid]');
    if (!c) return;
    const id = c.dataset.cid;
    cmpSel = cmpSel.includes(id) ? cmpSel.filter(x => x !== id) : [...cmpSel, id];
    renderCompare(ctx, el);
  };
}

export function renderItems(ctx, el) {
  const { S, esc, fmt, toast } = ctx;
  const draw = () => renderItems(ctx, el);
  const { items } = S.load();
  el.innerHTML = `<div class="sum-pill">满分 ${fmt(S.maxTotal(items))} · ${items.length} 项</div>` +
    items.map((it, i) => `<div class="item-edit" data-id="${it.id}">
      <div class="order"><button data-x="up" ${i === 0 ? 'disabled' : ''}>↑</button><button data-x="down" ${i === items.length - 1 ? 'disabled' : ''}>↓</button></div>
      <span class="ico">${itemIcon(it.id)}</span>
      <input class="name" value="${esc(it.name)}">
      <div class="stepper"><button data-x="dec">−</button><span>${fmt(it.max)}</span><button data-x="inc">＋</button></div>
      <button class="del" data-x="del" aria-label="删除">${IC.trash}</button>
    </div>`).join('') +
    `<button class="btn primary add-item btn-block" data-x="add" style="margin-top:6px"><span class="ico">${IC.plus}</span>添加评分项</button>` +
    `<button class="btn ghost btn-block" data-x="reset" style="margin-top:10px"><span class="ico">${IC.reset}</span>恢复默认</button>`;

  el.onclick = e => {
    const b = e.target.closest('[data-x]');
    if (!b) return;
    const id = b.closest('.item-edit')?.dataset.id;
    const it = items.find(x => x.id === id);
    switch (b.dataset.x) {
      case 'up': S.moveItem(id, -1); return draw();
      case 'down': S.moveItem(id, 1); return draw();
      case 'inc':
      case 'dec': {
        const m = Math.max(0.5, it.max + (b.dataset.x === 'inc' ? 0.5 : -0.5));
        if (!S.setItemMax(id, m)) toast('保存失败');
        return draw();
      }
      case 'del':
        if (confirm(`删除「${it.name}」？已有分数会保留`)) { S.deleteItem(id); draw(); }
        return;
      case 'add': {
        const nid = S.addItem('新评分项', 1);
        if (!nid) return toast('保存失败');
        draw();
        const inp = el.querySelector(`[data-id="${nid}"] input.name`);
        inp?.focus();
        inp?.select();
        return;
      }
      case 'reset':
        if (confirm('恢复为默认 19 项？')) { S.resetItems(); draw(); }
        return;
    }
  };

  el.onchange = e => {
    const inp = e.target;
    if (!inp.matches('input.name')) return;
    const id = inp.closest('.item-edit').dataset.id;
    const v = inp.value.trim();
    const old = items.find(x => x.id === id)?.name ?? '';
    if (!v || !S.renameItem(id, v)) inp.value = old;
  };
}

async function onImportFile(e) {
  const input = e.target;
  const f = input.files[0];
  input.value = '';
  if (!f || !ictx) return;
  const { S, toast, closeSheet, render } = ictx;
  try {
    const text = await f.text();
    const isCSV = /\.csv$/i.test(f.name) || text.replace(/^﻿/, '').split(/\r?\n/)[0].includes('名称');
    if (isCSV) {
      toast(`已导入 ${S.importCSV(text)} 个房源`);
    } else {
      const replace = confirm('覆盖现有数据？确定=覆盖，取消=合并');
      if (!S.importJSON(text, replace ? 'replace' : 'merge')) throw new Error('存储空间不足');
      toast('导入完成');
    }
    closeSheet();
    render();
  } catch (err) {
    toast(err.message || '导入失败');
  }
}

export function openSettings(ctx) {
  bindImport(ctx);
  ctx.openSheet(`<div class="btn-row">
      <button class="btn btn-block" data-s="json"><span class="ico">${IC.export}</span>导出 JSON</button>
      <button class="btn btn-block" data-s="csv"><span class="ico">${IC.export}</span>导出 CSV</button>
      <button class="btn btn-block" data-s="import"><span class="ico">${IC.import}</span>导入（JSON / CSV）</button>
      <button class="btn danger btn-block" data-s="clear"><span class="ico">${IC.trash}</span>清空全部</button>
    </div>`, body => {
    body.onclick = e => {
      const b = e.target.closest('[data-s]');
      if (!b) return;
      const { S, toast, closeSheet, render } = ctx;
      switch (b.dataset.s) {
        case 'json':
          download(`rentscore-${stamp()}.json`, S.exportJSON(), 'application/json;charset=utf-8');
          return;
        case 'csv':
          download(`rentscore-${stamp()}.csv`, S.exportCSV(), 'text/csv;charset=utf-8');
          return;
        case 'import':
          triggerImport(ctx);
          return;
        case 'clear':
          if (confirm('清空全部房源和评分？') && confirm('真的要清空吗？不可恢复')) {
            localStorage.removeItem(KEY);
            closeSheet();
            render();
            toast('已清空');
          }
          return;
      }
    };
  });
}
