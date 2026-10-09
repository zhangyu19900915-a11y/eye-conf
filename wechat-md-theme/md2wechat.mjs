// Markdown → 可直接粘贴微信的内联 HTML（doocs/md 渲染管线 + 本目录主题 + juice 内联 + 微信规范自检）
//
// 用法：
//   MD_REPO=/path/to/doocs-md node wechat-md-theme/md2wechat.mjs <输入.md> [主题.css] [输出.html]
// 依赖：MD_REPO 下已执行 pnpm install；本目录执行过 npm i juice@12
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'

const here = import.meta.dirname
const mdRepo = process.env.MD_REPO
if (!mdRepo) throw new Error('请设置环境变量 MD_REPO 为 doocs/md 仓库路径')
const [input, themeArg, outArg] = process.argv.slice(2)
if (!input) throw new Error('用法：node md2wechat.mjs <输入.md> [主题.css] [输出.html]')
const themeFile = themeArg ?? path.join(here, 'themes', '01-蓝金-医学进行时.css')
const outFile = outArg ?? input.replace(/\.md$/i, '') + '.wechat.html'

// doocs/md 渲染器依赖浏览器全局对象，先加载其 polyfill，再用 tsx 直接加载 TS 源码
const mcpDir = path.join(mdRepo, 'packages/mcp-server')
await import(pathToFileURL(path.join(mcpDir, 'polyfill.mjs')).href)
const mcpRequire = createRequire(path.join(mcpDir, 'package.json'))
const tsxDir = path.dirname(mcpRequire.resolve('tsx/package.json'))
const { register } = await import(pathToFileURL(path.join(tsxDir, 'dist/esm/api/index.mjs')).href)
register({ tsconfig: path.join(mcpDir, 'tsconfig.json') })
const { buildRenderedOutput } = await import(pathToFileURL(path.join(mcpDir, 'src/render-article.ts')).href)
const juiceMod = createRequire(path.join(here, 'package.json'))('juice')
const juice = juiceMod.default ?? juiceMod

const { html } = await buildRenderedOutput({
  markdown: fs.readFileSync(input, 'utf8'),
  theme: 'default',
  fontSize: '15px',
  lineHeight: '1.8',
  isUseJustify: false,
  legend: 'alt',
  codeBlockTheme: '', // 不加载代码高亮主题（需联网，医学稿用不到）
  customCSS: fs.readFileSync(themeFile, 'utf8'),
})

let body = juice(html, { inlinePseudoElements: true, preserveImportant: true, resolveCSSVariables: false, removeStyleTags: true })
body = body.replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<svg[\s\S]*?<\/svg>/gi, '') // 提示块图标，主题中已隐藏
  .replace(/\sclass="[^"]*"/g, '')
  // 去掉微信不识别的 CSS 变量、var() 与 color-mix()
  .replace(/\sstyle="([^"]*)"/g, (_, s) => {
    const kept = s.replace(/&quot;/g, '\'').split(';').map(d => d.trim())
      .filter(d => d && !d.startsWith('--') && !d.includes('color-mix(') && !d.includes('var('))
    return kept.length ? ` style="${kept.join('; ')};"` : ''
  })

// 微信「内容结构检测」：块元素必须显式写 text-align（left / center）
body = body.replace(/<(p|td|th|div|section|li|h[1-6]|blockquote|figure|figcaption|ol|ul)(\s[^>]*)?>/gi, (tag, name, attrs = '') => {
  if (/text-align\s*:/.test(attrs)) return tag
  const align = /^fig/i.test(name) ? 'center' : 'left'
  if (/\sstyle="/.test(attrs)) return `<${name}${attrs.replace(/\sstyle="/, ` style="text-align:${align}; `)}>`
  return `<${name}${attrs} style="text-align:${align};">`
})

const problems = ['display:flex', 'display: flex', 'linear-gradient', 'text-align:justify', 'text-align: justify', 'text-align:start', 'text-align: start', 'var(--', 'calc(', 'color-mix(']
  .filter(p => body.includes(p))
if (problems.length) {
  console.error('自检未通过，含微信不兼容写法：', problems.join('、'))
  process.exitCode = 1
}

const page = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${path.basename(input, '.md')}</title></head>
<body style="margin:0; background:#eef1f4;">
<div style="position:sticky; top:0; z-index:99; background:#1a5276; padding:10px 16px; text-align:right;">
<button onclick="copyContent()" style="background:#d4a017; color:#ffffff; border:none; padding:6px 16px; border-radius:3px; font-size:14px; cursor:pointer;">复制正文</button>
</div>
<div id="article" style="max-width:677px; margin:0 auto; background:#ffffff; padding:22px 18px; font-size:15px; line-height:1.8; color:#000000; text-align:left;">
${body}
</div>
<script>
async function copyContent() {
  var html = document.getElementById('article').outerHTML
  try {
    await navigator.clipboard.write([new ClipboardItem({ 'text/html': new Blob([html], { type: 'text/html' }), 'text/plain': new Blob([document.getElementById('article').innerText], { type: 'text/plain' }) })])
  } catch (e) {
    var h = function (ev) { ev.clipboardData.setData('text/html', html); ev.preventDefault() }
    document.addEventListener('copy', h); document.execCommand('copy'); document.removeEventListener('copy', h)
  }
  alert('已复制，可直接粘贴到公众号编辑器')
}
</script>
</body></html>
`
fs.writeFileSync(outFile, page)
console.log(`已输出：${outFile}`)
