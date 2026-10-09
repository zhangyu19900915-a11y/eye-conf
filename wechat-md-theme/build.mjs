// 生成 doocs/md（https://md.doocs.org）自定义 CSS 方案，规格对齐 med-wechat-publishing §5。
// 用法：node wechat-md-theme/build.mjs  → 输出到 wechat-md-theme/themes/*.css
import fs from 'node:fs'
import path from 'node:path'

const themes = [
  { file: '01-蓝金-医学进行时.css', name: '蓝金（医学进行时·主刊/视网膜）', primary: '#1a5276', accent: '#2e86c1', gold: '#d4a017', goldText: '#a9791b', gray: '#7f8c8d', tintP: '#f3f7fa', tintG: '#fbf6e7' },
  { file: '02-墨绿金-综述基础.css', name: '墨绿金（综述/基础研究）', primary: '#1e5631', accent: '#3c8a5a', gold: '#c8a23c', goldText: '#9a7a22', gray: '#7f8c8d', tintP: '#f2f7f3', tintG: '#faf6e8' },
  { file: '03-深紫银-神经眼科基因.css', name: '深紫银（神经眼科/基因治疗）', primary: '#4a2c6d', accent: '#7e57c2', gold: '#b0a06a', goldText: '#857745', gray: '#8a8597', tintP: '#f5f2f9', tintG: '#f8f6ee' },
  { file: '04-青灰橙-视光进行时.css', name: '青灰橙（视光进行时·副刊）', primary: '#16697a', accent: '#3aa6b9', gold: '#e08e0b', goldText: '#b06d05', gray: '#7c8a8d', tintP: '#f1f7f8', tintG: '#fdf5e9' },
]

const css = t => `/* doocs/md 自定义 CSS · ${t.name}
 * 规格：med-wechat-publishing §5（字号上限 15px，正文黑色，层级靠颜色/竖线/色块；无 flex/渐变/两端对齐）
 * Markdown 写法对照见 wechat-md-theme/README.md
 */

/* 正文 */
section, #output { font-family: -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif; font-size: 15px; line-height: 1.8; color: #000000; text-align: left; }
p { margin: 0 0 18px; padding: 0; font-size: 15px; line-height: 1.8; letter-spacing: 0; color: #000000; text-align: left; }
strong { font-weight: bold; color: #000000; }
em { font-style: normal; color: ${t.primary}; }
a { color: ${t.accent}; text-decoration: none; border-bottom: 1px solid ${t.accent}; }
.markup-highlight { background: none; padding: 0; border-radius: 0; font-weight: bold; color: ${t.goldText}; }

/* 主标题（#） */
h1 { display: block; margin: 0 0 20px; padding: 0; border: none; background: none; font-size: 15px; font-weight: bold; line-height: 1.7; color: ${t.primary}; text-align: left; }

/* 一级标题（##）：左侧点缀色竖线 */
h2 { display: block; margin: 26px 0 14px; padding: 0 0 0 10px; border: none; border-left: 4px solid ${t.gold}; background: none; font-size: 15px; font-weight: bold; line-height: 1.6; color: ${t.primary}; text-align: left; }

/* 二级标题 A（###）：点缀色下划线 */
h3 { display: table; margin: 20px 0 10px; padding: 0 0 2px; border: none; border-bottom: 2px solid ${t.gold}; background: none; font-size: 15px; font-weight: bold; line-height: 1.6; color: ${t.primary}; text-align: left; }

/* 二级标题 B（####）：强调色实心色块，与 ### 交替使用 */
h4 { display: table; margin: 20px 0 10px; padding: 4px 12px; border: none; border-radius: 3px; background: ${t.accent}; font-size: 14px; font-weight: bold; line-height: 1.6; color: #ffffff; text-align: left; }

/* 小节说明（#####）：灰色竖线，用于「参考文献：」等辅助标题 */
h5 { display: block; margin: 24px 0 6px; padding: 0 0 0 10px; border: none; border-left: 4px solid ${t.gray}; font-size: 14px; font-weight: bold; color: ${t.gray}; text-align: left; }
h6 { margin: 16px 0 6px; font-size: 14px; font-weight: bold; color: ${t.primary}; text-align: left; }

/* 列表 */
ul, ol { margin: 0 0 18px; padding-left: 1em; color: #000000; text-align: left; }
li { margin: 4px 0; font-size: 15px; line-height: 1.8; color: #000000; text-align: left; }

/* 普通引用（>）= 导语/总揽框：浅主色底 + 点缀色左竖线 */
blockquote { margin: 0 0 20px; padding: 12px 14px; border: none; border-left: 4px solid ${t.gold}; border-radius: 0; background: ${t.tintP}; font-style: normal; color: #000000; text-align: left; }
blockquote > p { margin: 0 0 8px; font-size: 15px; line-height: 1.8; letter-spacing: 0; color: #000000; text-align: left; }
blockquote > p:last-child { margin-bottom: 0; }

/* 提示块公共部分：去掉图标与 flex 标题 */
.markdown-alert-title { display: block; margin: 0 0 6px; font-size: 15px; font-weight: bold; text-align: left; }
.markdown-alert svg, .markdown-alert-title svg { display: none; }
blockquote.markdown-alert > p { font-size: 14px; }

/* > [!TIP] 临床意义 —— 米金底 + 金边 */
blockquote.markdown-alert-tip { border: 1px solid ${t.gold}; border-radius: 4px; background: ${t.tintG}; }
.markdown-alert-tip .markdown-alert-title { color: ${t.goldText}; }

/* > [!NOTE] 专家点评 —— 浅主色底 + 强调色左竖线 */
blockquote.markdown-alert-note { border: none; border-left: 4px solid ${t.accent}; border-radius: 0; background: ${t.tintP}; }
.markdown-alert-note .markdown-alert-title { color: ${t.accent}; }

/* > [!IMPORTANT] 研究速览 —— 主色描边卡 + 主色标题条 */
blockquote.markdown-alert-important { padding: 0 14px 12px; border: 1px solid ${t.primary}; border-radius: 4px; background: #ffffff; }
.markdown-alert-important .markdown-alert-title { margin: 0 -14px 10px; padding: 6px 14px; background: ${t.primary}; font-size: 14px; color: #ffffff; }

/* > [!QUOTE] 参考文献 —— 13px 灰色 */
blockquote.markdown-alert-quote { padding: 0; border: none; background: none; }
.markdown-alert-quote .markdown-alert-title { padding-left: 10px; border-left: 4px solid ${t.gray}; font-size: 14px; color: ${t.gray}; }
blockquote.markdown-alert-quote > p, blockquote.markdown-alert-quote li { margin: 0 0 4px; font-size: 13px; line-height: 1.7; color: ${t.gray}; }
blockquote.markdown-alert-quote ol { margin: 0; color: ${t.gray}; }

/* > [!WARNING] 合规提示（如「该适应证国内尚未获批」） */
blockquote.markdown-alert-warning { border: none; border-left: 4px solid ${t.gray}; background: #f4f5f6; }
.markdown-alert-warning .markdown-alert-title { font-size: 14px; color: ${t.gray}; }

/* 图片与图注 */
figure { margin: 0 0 20px; text-align: center; }
img { max-width: 100%; margin: 0 auto; border-radius: 0; }
figcaption, .md-figcaption { margin-top: 6px; font-size: 12px; line-height: 1.6; color: ${t.gray}; text-align: center; }

/* 表格 */
table { width: 100%; margin: 0 0 20px; border-collapse: collapse; font-size: 14px; color: #000000; }
thead { background: ${t.primary}; color: #ffffff; }
th { padding: 6px 8px; border: 1px solid ${t.primary}; background: ${t.primary}; font-weight: bold; color: #ffffff; text-align: left; }
td { padding: 6px 8px; border: 1px solid #dfe6ec; line-height: 1.6; color: #000000; text-align: left; }

/* 分隔线、行内代码、脚注 */
hr { height: 0; margin: 24px 0; border: none; border-top: 1px solid #e3e6e8; }
.codespan, code { font-size: 13px; color: ${t.primary}; background: #f2f4f5; padding: 1px 4px; border-radius: 2px; }
p.footnotes { margin: 0; font-size: 13px; line-height: 1.7; color: ${t.gray}; text-align: left; }
`

const outDir = path.join(import.meta.dirname, 'themes')
fs.mkdirSync(outDir, { recursive: true })
for (const t of themes) {
  const out = css(t)
  for (const bad of ['display: flex', 'display:flex', 'linear-gradient', 'justify'])
    if (out.includes(bad)) throw new Error(`${t.file} 含微信不兼容写法：${bad}`)
  fs.writeFileSync(path.join(outDir, t.file), out)
  console.log('written', t.file)
}
