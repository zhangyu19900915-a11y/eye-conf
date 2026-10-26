// 从 index.html 抽出 CONFS 数组，生成小程序数据文件 miniprogram/data/confs.js
// 用法：node scripts/build-mp-data.js   （每次改完 index.html 的会议数据后跑一次）
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const m = html.match(/var CONFS=(\[[\s\S]*?\n\]);/);
if (!m) throw new Error('index.html 里没找到 var CONFS=[...];');
const confs = vm.runInNewContext(m[1]);
const upd = (html.match(/更新于 (\d{4}-\d{2}-\d{2})/) || [])[1] || '';

const out = '// 由 scripts/build-mp-data.js 从 index.html 自动生成，请勿手改\n'
  + 'module.exports = ' + JSON.stringify({ updated: upd, list: confs }, null, 1) + ';\n';
fs.writeFileSync(path.join(root, 'miniprogram/data/confs.js'), out);
console.log('已生成 ' + confs.length + ' 场会议，数据更新于 ' + upd);
