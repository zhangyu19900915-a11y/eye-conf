const C = require('../../utils/conf.js');
const S = require('../../utils/store.js');
const Cal = require('../../utils/calendar.js');

Page({
  data: { v: null },

  // 分享链接用会议名 k 定位（数据增删后序号会变），列表跳转用序号 id
  onLoad(o) {
    const list = C.all();
    const k = o.k ? decodeURIComponent(o.k) : '';
    this.id = k ? list.findIndex(c => c.n === k) : +o.id;
    this.conf = list[this.id];
    if (!this.conf) { wx.showToast({ title: '会议不存在', icon: 'none' }); return; }
    this.render();
    wx.setNavigationBarTitle({ title: this.conf.a || '会议详情' });
  },

  render() { this.setData({ v: C.view(this.conf, this.id, C.today(), S.getFavs()) }); },

  onFav() {
    const on = S.toggleFav(this.conf.n);
    this.render();
    wx.showToast({ title: on ? '已收藏' : '已取消收藏', icon: 'none' });
  },

  async onCalendar() {
    try {
      const n = await Cal.addConference(this.conf);
      wx.showToast({ title: n ? '已加入日历（含截止提醒）' : '已加入日历', icon: 'none' });
    } catch (e) {
      if (!/cancel/i.test(e && e.errMsg || '')) wx.showToast({ title: '未能写入日历，请检查日历权限', icon: 'none' });
    }
  },

  onCopyInfo() {
    wx.setClipboardData({ data: C.shareText(this.conf, C.today()), success: () => wx.showToast({ title: '已复制，可粘贴到微信群', icon: 'none' }) });
  },

  // 小程序内不能直接打开外部网页，复制链接让用户到浏览器打开
  onCopyUrl() {
    wx.setClipboardData({ data: this.conf.u, success: () => wx.showModal({ title: '官网链接已复制', content: '请粘贴到手机浏览器打开：\n' + this.conf.u, showCancel: false }) });
  },

  onCopyKeyword() {
    const k = C.searchKeyword(this.conf);
    const where = this.conf.cn ? '微信顶部「搜一搜」' : '浏览器（谷歌）';
    wx.setClipboardData({ data: k, success: () => wx.showModal({ title: '检索词已复制', content: '该会议暂无独立官网，可在' + where + '中粘贴搜索：\n' + k, showCancel: false }) });
  },

  onShareAppMessage() {
    const v = this.data.v;
    return { title: v ? (v.a || v.n) + ' · ' + v.year + '年' + v.range + ' · ' + v.p : '眼科会议速查', path: '/pages/detail/detail?k=' + encodeURIComponent(this.conf.n) };
  },
  onShareTimeline() {
    const v = this.data.v;
    return { title: v ? (v.a || v.n) + ' ' + v.year + '年' + v.range : '眼科会议速查', query: 'k=' + encodeURIComponent(this.conf.n) };
  }
});
