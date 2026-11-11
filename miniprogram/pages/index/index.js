const C = require('../../utils/conf.js');
const S = require('../../utils/store.js');

const FILTERS = ['即将召开', '📮 截止节点', '☆ 我的收藏', '全部', '⭐ 重点', '国内会议'];

Page({
  data: {
    filters: FILTERS, dirs: [], f: '即将召开', d: [], q: '', // d：已选方向，可多选，空=全部
    next: null, hot: [], groups: [], dlGroups: [], stats: '', updated: C.updated()
  },

  onLoad() { this.refresh(); },
  onShow() { this.refresh(); }, // 从详情页返回时同步收藏状态
  onPullDownRefresh() { this.refresh(); wx.stopPullDownRefresh(); },

  refresh() {
    const t = C.today(), favs = S.getFavs(), q = this.data.q.trim().toLowerCase();
    const { f, d } = this.data;
    const passDir = c => !d.length || C.dirsOf(c).some(x => d.indexOf(x) >= 0);
    const dirs = C.DIR_NAMES.map(n => ({ name: n, on: n === '全部方向' ? !d.length : d.indexOf(n) >= 0 }));
    this.setData({ dirs });
    const passQ = c => !q || (c.n + ' ' + c.p + ' ' + (c.a || '')).toLowerCase().indexOf(q) >= 0;

    const hot = C.deadlines(t).filter(x => x.left <= 30);
    const next = C.nextCore(t);

    if (f === '📮 截止节点') {
      const items = C.deadlines(t, c => passDir(c) && passQ(c));
      this.setData({
        next, hot, groups: [], dlGroups: C.groupBy(items, x => x.ym),
        stats: '待到的投稿 / 注册节点共 ' + items.length + ' 个，点击查看会议详情'
      });
      return;
    }

    const list = C.all().map((c, i) => ({ c, i })).filter(({ c }) => {
      const st = C.status(c, t).k;
      if (f === '即将召开' && st === 'past') return false;
      if (f === '⭐ 重点' && !c.core) return false;
      if (f === '国内会议' && !c.cn) return false;
      if (f === '☆ 我的收藏' && !favs[c.n]) return false;
      return passDir(c) && passQ(c);
    }).sort((a, b) => C.pd(a.c.s) - C.pd(b.c.s)).map(({ c, i }) => C.view(c, i, t, favs));

    const fut = C.all().filter(c => C.status(c, t).k !== 'past').length;
    this.setData({
      next, hot, dlGroups: [],
      groups: C.groupBy(list, v => v.year + '年' + v.month + '月'),
      stats: '显示 ' + list.length + ' 场 · 共收录 ' + C.all().length + ' 场，未闭幕 ' + fut + ' 场'
    });
  },

  onFilter(e) { this.setData({ f: e.currentTarget.dataset.v }); this.refresh(); },
  onDir(e) {
    const v = e.currentTarget.dataset.v;
    let d = this.data.d.slice();
    if (v === '全部方向') d = [];
    else { const k = d.indexOf(v); if (k >= 0) d.splice(k, 1); else d.push(v); }
    this.setData({ d }); this.refresh();
  },
  onSearch(e) { this.setData({ q: e.detail.value }); this.refresh(); },
  open(e) { wx.navigateTo({ url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id }); },

  onShareAppMessage() { return { title: '眼科会议速查：国内外会议时间、投稿与注册截止', path: '/pages/index/index' }; },
  onShareTimeline() { return { title: '眼科会议速查 · 医学进行时' }; }
});
