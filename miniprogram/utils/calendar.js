// 写入手机系统日历：会议本身（开幕前 7 天提醒）+ 每个未到的截止节点（提前 3 天提醒）
const C = require('./conf.js');

function add(opts) {
  return new Promise((resolve, reject) => wx.addPhoneCalendar(Object.assign({ success: resolve, fail: reject }, opts)));
}

async function addConference(c) {
  const t = C.today();
  const desc = [c.n, c.sub && '投稿：' + c.sub, c.reg && '注册：' + c.reg, c.note, c.u && '官网：' + c.u]
    .filter(Boolean).join('\n');
  // 会议本体
  await add({
    title: c.a || c.n, startTime: Math.floor(+C.pd(c.s) / 1000), endTime: Math.floor(+C.pd(c.e) / 1000) + 86399,
    allDay: true, location: c.p, description: desc, alarm: true, alarmOffset: 7 * 86400
  });
  // 截止节点，系统每次只能写一条，逐条弹确认
  const hots = (c.hots || []).filter(h => C.pd(h.d) >= t);
  for (const h of hots) {
    try {
      await add({
        title: '⏰ ' + (c.a || c.n) + ' · ' + h.t, startTime: Math.floor(+C.pd(h.d) / 1000), allDay: true,
        description: c.n, alarm: true, alarmOffset: 3 * 86400
      });
    } catch (e) { break; } // 用户取消就不再继续弹
  }
  return hots.length;
}

module.exports = { addConference };
