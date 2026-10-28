// 本机存储：收藏
const KEY = 'eyeconf_fav';
function getFavs() { try { return wx.getStorageSync(KEY) || {}; } catch (e) { return {}; } }
function toggleFav(name) {
  const m = getFavs();
  if (m[name]) delete m[name]; else m[name] = 1;
  try { wx.setStorageSync(KEY, m); } catch (e) {}
  return !!m[name];
}
module.exports = { getFavs, toggleFav };
