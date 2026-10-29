// 会议数据的计算逻辑（与网页版 index.html 保持一致）
const DATA = require('../data/confs.js');

const DIRS = [
  ['视网膜', /视网膜|眼底|retina|黄斑|macula|玻璃体|apvrs|asrs|jrvs|iscev|血管/i],
  ['白内障·屈光', /白内障|屈光|escrs|ascrs|apacrs|jscrs/i],
  ['青光眼', /青光眼|glaucoma|ags |apgc|wgc|egs/i],
  ['视光·近视', /视光|近视|optometry|academy|vision china|brightchina/i],
  ['小儿·斜视', /小儿|儿童|斜视|aapos/i],
  ['神经眼科', /神经眼科|nanos|eunos/i],
  ['眼眶·眼整形', /眼眶|眼整形|甲状腺|泪器|眼肿瘤|asoprs|esoprs|isoo/i],
  ['眼表·干眼', /干眼|眼表|角膜/i]
];
const DIR_NAMES = ['全部方向'].concat(DIRS.map(d => d[0]), ['综合']);

function pd(s) { const a = s.split('-'); return new Date(+a[0], a[1] - 1, +a[2]); }
function today() { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); }
function days(a, b) { return Math.round((a - b) / 864e5); }
function md(d) { return (d.getMonth() + 1) + '月' + d.getDate() + '日'; }

function dateRange(c) {
  const s = pd(c.s), e = pd(c.e);
  if (c.s === c.e) return md(s);
  return md(s) + '–' + (s.getMonth() === e.getMonth() ? '' : (e.getMonth() + 1) + '月') + e.getDate() + '日';
}

function status(c, t) {
  const s = pd(c.s), e = pd(c.e);
  if (t > e) return { k: 'past', text: '已闭幕' };
  if (t >= s) return { k: 'now', text: '进行中', day: days(t, s) + 1, len: days(e, s) + 1 };
  const d = days(s, t);
  return { k: d <= 45 ? 'soon' : 'future', text: '距开幕 ' + d + ' 天', days: d };
}

function dirsOf(c) {
  const t = c.n + ' ' + (c.a || '');
  const d = DIRS.filter(x => x[1].test(t)).map(x => x[0]);
  return d.length ? d : ['综合'];
}

function hotsOf(c, t) {
  const live = [], off = [];
  (c.hots || []).forEach(h => {
    const d = pd(h.d), left = days(d, t);
    if (left >= 0) live.push({ date: md(d), t: h.t, left: left, leftText: left ? '还剩 ' + left + ' 天' : '今天！' });
    else off.push(h.t.replace(/（.*?）/g, '') + '：' + md(d) + '（已过）');
  });
  return { live, off };
}

// 列表卡片和详情页用的视图对象
function view(c, i, t, favs) {
  const s = pd(c.s), st = status(c, t), h = hotsOf(c, t);
  return {
    id: i, n: c.n, a: c.a || '', p: c.p, u: c.u || '', core: !!c.core, cn: !!c.cn,
    year: s.getFullYear(), month: s.getMonth() + 1, day: s.getDate(), range: dateRange(c),
    st: st, dirs: dirsOf(c), hots: h.live, offHots: h.off,
    sub: c.sub || '', reg: c.reg || '', note: c.note || '',
    feeHead: c.feeHead || null, fees: c.fees || null, feeNote: c.feeNote || '',
    fee2Title: c.fee2Title || '', fee2Head: c.fee2Head || null, fees2: c.fees2 || null,
    fav: !!(favs && favs[c.n])
  };
}

function all() { return DATA.list; }
function updated() { return DATA.updated; }

function nextCore(t) {
  const l = DATA.list.map((c, i) => ({ c, i })).filter(x => x.c.core && !x.c.cn && status(x.c, t).k !== 'past')
    .sort((a, b) => pd(a.c.s) - pd(b.c.s));
  if (!l.length) return null;
  const f = l[0], st = status(f.c, t);
  return {
    id: f.i, name: f.c.a || f.c.n, place: f.c.p, date: pd(f.c.s).getFullYear() + '年' + dateRange(f.c),
    big: st.k === 'now' ? 'Day ' + st.day : String(st.days),
    unit: st.k === 'now' ? '/ 共 ' + st.len + ' 天 · 进行中' : '天后开幕',
    next2: l[1] ? (l[1].c.a || l[1].c.n) + ' · ' + pd(l[1].c.s).getFullYear() + '年' + dateRange(l[1].c) + ' · ' + status(l[1].c, t).days + ' 天' : ''
  };
}

// 所有未到的投稿/注册节点，按日期排
function deadlines(t, filterFn) {
  const items = [];
  DATA.list.forEach((c, i) => {
    if (filterFn && !filterFn(c)) return;
    (c.hots || []).forEach(h => {
      const d = pd(h.d), left = days(d, t);
      if (left >= 0) items.push({
        id: i, ts: +d, ym: d.getFullYear() + '年' + (d.getMonth() + 1) + '月', date: md(d),
        name: (c.core ? '⭐ ' : '') + (c.a || c.n), t: h.t, left: left,
        level: left <= 7 ? 'red' : left <= 30 ? 'gold' : 'blue'
      });
    });
  });
  return items.sort((a, b) => a.ts - b.ts);
}

// 按 年月 分组，供 wx:for 嵌套渲染
function groupBy(items, keyFn) {
  const out = [];
  items.forEach(it => {
    const k = keyFn(it);
    if (!out.length || out[out.length - 1].key !== k) out.push({ key: k, items: [] });
    out[out.length - 1].items.push(it);
  });
  return out;
}

// 转发到微信群的文字
function shareText(c, t) {
  const L = ['【' + (c.a || '眼科会议') + '】' + c.n, '📅 ' + pd(c.s).getFullYear() + '年' + dateRange(c), '📍 ' + c.p];
  hotsOf(c, t).live.forEach(h => L.push('⏰ ' + h.date + ' ' + h.t));
  if (c.sub) L.push('📝 投稿：' + c.sub);
  if (c.reg) L.push('🎫 注册：' + c.reg);
  if (c.u) L.push('🔗 ' + c.u);
  L.push('—— 《医学进行时》眼科会议速查小程序');
  return L.join('\n');
}

// 没有官网时给出的检索词
function searchKeyword(c) {
  return c.g || (c.cn ? c.n.replace(/（.*?）/g, '') : (c.a || c.n) + ' official website');
}

module.exports = { DIR_NAMES, pd, today, days, md, dateRange, status, dirsOf, hotsOf, view, all, updated, nextCore, deadlines, groupBy, shareText, searchKeyword };
