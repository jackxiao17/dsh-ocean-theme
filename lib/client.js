/**
 * dsh-ocean-theme — Client half（纯 CSS 双主题：浅海 / 深海）。
 *
 * 四件事：
 *   1) Markdown 语义配色（琥珀 / 薄荷 / 青蓝三色结构，深浅双档）；
 *   2) 正文等宽排版 + 表格卡片化 + 全站琥珀强调色；
 *   3) 深海主题（深色档）：官方首页深蓝画布 + 分层面板（侧栏/会话/输入卡/
 *      弹窗四级深度），海军蓝 token 全表覆盖；
 *   4) 浅海主题（浅色档）：同一构图的亮蓝画布 + 白玻璃面板。
 *   两档跟随 DSH 外观偏好自动切换，无任何设置项。
 *
 * ── 设计法则（0.12.0 深度定制，自 ui-ux-pro-max 设计库提炼）──────────
 *   · 分层深度：deep(画布) → base(侧栏) → elevated(输入卡) → overlay(弹窗)
 *     四级明度阶梯，相邻级差拉开，杜绝「糊成一片」；
 *   · 边框只用发丝线 rgba（蓝白 6%–16%），不用实灰；
 *   · 每个浮起表面带「顶缘内发光」inset 0 1px rgba(255,255,255,α)；
 *   · 阴影用蓝黑 rgba(1,8,24,…) 而非纯黑，四档高度 (8/24/48/70px)；
 *   · 禁纯黑背景（#071323 起），弹窗用 backdrop-filter 玻璃。
 *   渐变画布配方自 JohnnyTing/dsh-official-homepage-theme（MIT）的官方首页
 *   复刻移植：深色档为官方原方，浅色档为同构图亮蓝改编。
 *
 * ── 画布实现 ─────────────────────────────────────────────────────────
 *   body::before（fixed, z -1）铺满屏渐变（本身不透明，含兜底色）；
 *   body 背景置透明，画布即渐变；面板全部半透明玻璃浮在其上。
 *   深浅两档各一组 token + 结构规则，body[data-ds-dark-theme] 切换。
 *
 * 选择器为什么这么写（升级韧性）：
 *   Markdown 容器由 CSS Modules 生成，形如 `_markdown_1ypvv_5`，哈希随构建
 *   变化、本地名（`markdown`）稳定，因此统一用 `[class*="_markdown_"]`；
 *   再用 `:not([data-markdown-variant])` 排除「compact」变体（思考过程 /
 *   紧凑预览保持中性配色，但跟随等宽）。
 *
 * 为什么强调属性用 !important：
 *   产品对 Markdown 有显式类规则（特异性 ≥ (0,2,x)），主题身份属性必须压过它；
 *   token 覆盖拔到 html body / body[data-ds-dark-theme] 前缀，与插入顺序无关。
 */

window.__ModuleLoader__.load({
  id: 'dsh-ocean-theme',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })

    const MARKDOWN_STYLE_ID = 'dsh-ocean-theme-style'
    const THEME_STYLE_ID = 'dsh-ocean-theme-surface'

    /* ══════════════════════ 1) Markdown 配色（原有能力） ══════════════════════ */

    const MARKDOWN_CSS = `
/* ── 浅色：琥珀单主色（深琥珀压得住白底），冷色只留「代码」与「链接」两档 ──
 * 标题与加粗同色：重点靠字号/字重区分，不再让两个色相并列抢主次。
 * 深琥珀 #8a4b00 在白底 6.8:1，比原来的 #b06915（4.9:1）明显更实，仍读作琥珀而不是棕。
 */
:root {
  --sea-heading: #a05a00;
  --sea-heading-soft: #a86212;
  --sea-strong: #a05a00;
  --sea-em: #8a5f16;
  --sea-code: #27793d;
  --sea-code-bg: rgba(61, 154, 87, 0.10);
  --sea-code-border: rgba(61, 154, 87, 0.28);
  --sea-ul-marker: #b06915;
  --sea-ul-marker-2: #2c66b8;
  --sea-ul-marker-3: #27793d;
  --sea-ol-marker: #2c66b8;
  --sea-link: #2c66b8;
  --sea-quote: #b0851f;
  --sea-quote-bg: rgba(176, 133, 31, 0.07);
  --sea-rule: rgba(138, 75, 0, 0.22);
  --sea-code-label: #27793d;

  /* 表格卡片：跟主色同系（琥珀），靠卡片框 + 表头字与引用块区分 */
  --sea-table-frame: rgba(138, 75, 0, 0.22);
  --sea-table-row: rgba(15, 23, 42, 0.07);
  --sea-table-head-bg: rgba(138, 75, 0, 0.08);
  --sea-table-head-text: #6b3a00;

  /* 全站强调色：深琥珀（白底 6.8:1；浅色主题按钮文字近白，填充压得住） */
  --sea-accent: #8a4b00;
  --sea-accent-fill: #8a4b00;
  --sea-accent-hover: #743f00;
  --sea-selection-bg: rgba(138, 75, 0, 0.20);

  --sea-mono: "JetBrains Mono", "Cascadia Mono PL", "Cascadia Mono", "Cascadia Code",
    "Fira Code", "Maple Mono", "SFMono-Regular", Consolas, "Liberation Mono", Menlo,
    "PingFang SC", "Microsoft YaHei", monospace;
}

/* ── 深色：同一个琥珀单主色（暗底 8.7:1），加粗也回到琥珀，靠字重区分 ──── */
body[data-ds-dark-theme] {
  --sea-heading: #f5a742;
  --sea-heading-soft: #d99b4e;
  --sea-strong: #f5a742;
  --sea-em: #e5c07b;
  --sea-code: #7fd88f;
  /* 深色也给行内代码一层薄荷底：与浅色档观感统一，且能把代码从正文里"抬"出来。
     暗底上同色 tint 要比浅色档（10%）略重才看得见，取 13%，仍保持文字 7.7:1。 */
  --sea-code-bg: rgba(127, 216, 143, 0.13);
  --sea-code-border: rgba(127, 216, 143, 0.26);
  --sea-ul-marker: #fab283;
  --sea-ul-marker-2: #56b6c2;
  --sea-ul-marker-3: #7fd88f;
  --sea-ol-marker: #56b6c2;
  --sea-link: #56b6c2;
  --sea-quote: #e5c07b;
  --sea-quote-bg: rgba(229, 192, 123, 0.06);
  --sea-rule: rgba(245, 167, 66, 0.26);
  --sea-code-label: #7fd88f;

  --sea-table-frame: rgba(245, 167, 66, 0.28);
  --sea-table-row: rgba(255, 255, 255, 0.075);
  --sea-table-head-bg: rgba(245, 167, 66, 0.10);
  --sea-table-head-text: #f2cf9d;

  /* 全站强调色：琥珀（深色主题按钮文字近黑，填充对近黑字约 8.7:1） */
  --sea-accent: #f5a742;
  --sea-accent-fill: #f5a742;
  --sea-accent-hover: #ffbf70;
  --sea-selection-bg: rgba(245, 167, 66, 0.26);
}

/* ── 全站强调色：按钮 / 开关 / 勾选框 / 焦点环 / 输入框聚焦边 ──────────────
 * 这里必须用 (0,0,2)/(0,1,2) 的特异性 + !important，不能写成单独的 body 规则：
 * ui-theme 的 base.css 用 body{…}（浅色）与 body[data-ds-dark-theme]{…}（深色）
 * 声明同名的 --dsw-alias-* token，和插件原来的 body 写法是「同元素、同特异性」
 * 的平局，胜负只由 <style> 在 head 里的先后决定。
 * 冷启动时本插件的 Client 半边没有任何服务依赖，apply 比 ui-theme 早，
 * 我们的 <style> 先插入、base.css 后插入 → 平局判负，强调色退回产品默认色；
 * 运行期「关掉插件再打开」时 base.css 早已在文档里，我们的标签追加到最后 → 又赢。
 * 这正是「重启丢强调色、重开插件才正常」的全部原因。
 * 提高特异性后与插入顺序无关：冷启动、热重载、深浅色切换都稳定生效。
 */
html body,
html body[data-ds-dark-theme] {
  --dsw-alias-brand-primary: var(--sea-accent) !important;
  --dsw-alias-button-primary-fill: var(--sea-accent-fill) !important;
  --dsw-alias-button-primary-hover: var(--sea-accent-hover) !important;
  --dsw-alias-state-business-primary: var(--sea-accent) !important;
}

/* ── 选区：跟随主题色，不再是系统蓝（同样拔一档特异性，避免被后插入的样式表盖掉） ── */
html body ::selection {
  background: var(--sea-selection-bg);
}

/* ── 正文等宽：只作用于 Markdown，UI 外壳保持原字体 ─────────────────── */
[class*="_markdown_"] {
  --dsw-font-family: var(--sea-mono);
}

/* ── 标题：琥珀单主色（深浅两档同色相），层级越高越实，h4–h6 收敛一档 ── */
[class*="_markdown_"]:not([data-markdown-variant]) :is(h1, h2, h3, h4, h5, h6) {
  color: var(--sea-heading) !important;
  letter-spacing: -0.01em;
  margin-top: 26px !important;
  margin-bottom: 10px !important;
}

[class*="_markdown_"]:not([data-markdown-variant]) h1 {
  margin-top: 30px !important;
}

[class*="_markdown_"]:not([data-markdown-variant]) h3 {
  margin-top: 22px !important;
}

[class*="_markdown_"]:not([data-markdown-variant]) :is(h4, h5, h6) {
  color: var(--sea-heading-soft) !important;
  margin-top: 20px !important;
}

/* 标题后的第一块收紧，让标题和它的内容成为一组 */
[class*="_markdown_"]:not([data-markdown-variant]) :is(h1, h2, h3, h4, h5, h6) + :is(p, ul, ol, blockquote, pre) {
  margin-top: 8px !important;
}

[class*="_markdown_"]:not([data-markdown-variant]) :is(h1, h2, h3, h4, h5, h6) + [class*="_tableScroll_"] {
  margin-top: 8px !important;
}

/* 标题里的加粗跟随标题色，避免彩色标题里蹦出另一种彩色字 */
[class*="_markdown_"]:not([data-markdown-variant]) :is(h1, h2, h3, h4, h5, h6) :is(strong, b) {
  color: inherit !important;
}

/* ── 加粗：暖金琥珀，结论一眼可见 ──────────────────────────────────── */
[class*="_markdown_"]:not([data-markdown-variant]) :is(strong, b) {
  color: var(--sea-strong) !important;
}

/* ── 行内代码：薄荷绿 + 同色淡底（深浅两档都有，只差透明度） ────────────── */
[class*="_markdown_"]:not([data-markdown-variant]) :not(pre) > code {
  color: var(--sea-code) !important;
  background-color: var(--sea-code-bg) !important;
  border-color: var(--sea-code-border) !important;
  font-weight: 600;
}

/* 标题里的行内代码不上底色：标题本身已经是彩色块，再加胶囊会互相打架 */
[class*="_markdown_"]:not([data-markdown-variant]) :is(h1, h2, h3, h4, h5, h6) :not(pre) > code {
  background-color: transparent !important;
  border-color: transparent !important;
}

/* ── 斜体：小麦暖黄；删除线：灰字 + 主题色划线 ───────────────────────── */
[class*="_markdown_"]:not([data-markdown-variant]) :is(em, i) {
  color: var(--sea-em);
}

[class*="_markdown_"]:not([data-markdown-variant]) :is(del, s) {
  color: var(--dsw-alias-state-idle-primary, #999);
  text-decoration-color: var(--sea-accent);
  opacity: 0.85;
}

/* ── 列表标记：第一层蜜桃橙，往下两层转青蓝、薄荷，形成深度线索 ─────────── */
[class*="_markdown_"]:not([data-markdown-variant]) ul > li::marker {
  color: var(--sea-ul-marker);
}

[class*="_markdown_"]:not([data-markdown-variant]) :is(ul, ol) ul > li::marker {
  color: var(--sea-ul-marker-2);
}

[class*="_markdown_"]:not([data-markdown-variant]) :is(ul, ol) :is(ul, ol) ul > li::marker {
  color: var(--sea-ul-marker-3);
}

[class*="_markdown_"]:not([data-markdown-variant]) ol > li::marker {
  color: var(--sea-ol-marker);
  font-weight: 600;
}

/* ── 链接：青蓝；悬停不变色、不加框，仅出现产品的 dotted 下划线（跟随文字色） ── */
[class*="_markdown_"]:not([data-markdown-variant]) a {
  color: var(--sea-link) !important;
}

[class*="_markdown_"]:not([data-markdown-variant]) a:hover,
[class*="_markdown_"]:not([data-markdown-variant]) a:focus {
  text-decoration-color: currentColor !important;
}

[class*="_markdown_"] [class*="_fileMention_"] {
  color: var(--sea-link) !important;
}

[class*="_markdown_"] [class*="_fileMention_"]:hover,
[class*="_markdown_"] [class*="_fileMention_"]:focus {
  text-decoration-color: currentColor !important;
}

/* ── 引用块：小麦色左边线 + 极淡同色底，上下留白，与表格彻底分开 ────────── */
[class*="_markdown_"]:not([data-markdown-variant]) blockquote {
  border-left: 3px solid var(--sea-quote) !important;
  background: var(--sea-quote-bg);
  border-radius: 0 var(--dsw-radius-sm, 8px) var(--dsw-radius-sm, 8px) 0;
  margin: 16px 0;
  padding: 2px 14px;
}

/* ── 分割线：主题色淡线 ───────────────────────────────────────────── */
[class*="_markdown_"]:not([data-markdown-variant]) hr {
  background: var(--sea-rule) !important;
}

/* ── 表格：卡片化（主题色外框 + 表头底 + 表头字 + 行分隔线） ────────────── */
[class*="_markdown_"] [class*="_tableScroll_"] {
  border: 1px solid var(--sea-table-frame) !important;
  border-radius: var(--dsw-radius-md, 12px) !important;
  /* 只设纵向外边距：横向留空是产品给超宽表格做通栏负边距用的 */
  margin-top: 16px;
  margin-bottom: 16px;
}

[class*="_markdown_"] th {
  background: var(--sea-table-head-bg);
  color: var(--sea-table-head-text) !important;
  /* 表头分隔线用框线色，让卡片结构更清楚 */
  border-bottom-color: var(--sea-table-frame) !important;
}

[class*="_markdown_"] td {
  border-bottom-color: var(--sea-table-row) !important;
}

/* 产品为贴边把首列左内距、末列右内距清零；卡片里要补回，否则文字贴框 */
[class*="_markdown_"] [class*="_tableScroll_"] :is(th, td):first-child {
  padding-left: 16px !important;
}

[class*="_markdown_"] [class*="_tableScroll_"] :is(th, td):last-child {
  padding-right: 16px !important;
}

/* 最后一行不再画线，避免与外框叠成双线 */
[class*="_markdown_"] [class*="_tableScroll_"] tbody tr:last-child td {
  border-bottom-color: transparent !important;
}

/* 4 列以上的「通栏」表格：产品用负边距 + 左内距把表格铺到视野两侧，
   卡片框会因此和文字脱节。这里收回横向偏移，让宽表在卡片内横向滚动。 */
[class*="_markdown_"] [class*="_tableScroll_"].md-table-wide {
  width: fit-content;
  max-width: 100%;
  margin-left: 0;
  padding-left: 0;
}

/* ── 任务列表勾选框 ─────────────────────────────────────────────────
 * 产品同名规则是 ._markdown_… input[type=checkbox]（(0,1,1)，与这里打平），
 * 胜负只由插入顺序决定；加 !important 与 ui-theme 的插入时机彻底解耦。 */
[class*="_markdown_"] input[type="checkbox"] {
  accent-color: var(--sea-accent) !important;
}

/* ── 代码块语言标签：呼应主题代码色 ─────────────────────────────────── */
[class*="_markdown_"] [class*="_infostring_"] {
  color: var(--sea-code-label);
}
`

    /* ══════════════════ 2) 深海 / 浅海 双主题（纯 CSS，无设置） ══════════════════ */

    const THEME_CSS = `
/* ═══ 画布：body::before 铺满屏渐变（不透明，自带兜底色） ══════════════
 * body 背景置透明 → 画布即渐变；面板半透明浮在其上。
 * 深色档 = 官方首页渐变配方（JohnnyTing/dsh-official-homepage-theme，MIT）；
 * 浅色档 = 同一构图的亮蓝改编（浅海 → 天光）。 */
html {
  background: #e8f0fa;
}

html:has(body[data-ds-dark-theme]) {
  background: #071323;
}

body::before {
  position: fixed;
  content: '';
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background-image:
    radial-gradient(980px 520px at 66% -4%, rgba(255, 255, 255, 0.9), transparent 60%),
    radial-gradient(760px 460px at 18% 20%, rgba(96, 149, 212, 0.30), transparent 68%),
    radial-gradient(640px 420px at 54% 52%, rgba(118, 168, 224, 0.18), transparent 72%),
    radial-gradient(560px 400px at 100% 70%, rgba(255, 255, 255, 0.55), transparent 64%),
    linear-gradient(180deg, #edf3fb 0%, #dde9f7 45%, #c8d9ef 100%);
}

body[data-ds-dark-theme]::before {
  background-image:
    radial-gradient(980px 520px at 66% -4%, rgba(195, 216, 220, 0.34), transparent 60%),
    radial-gradient(760px 460px at 18% 20%, rgba(44, 97, 156, 0.42), transparent 68%),
    radial-gradient(640px 420px at 54% 52%, rgba(56, 104, 155, 0.22), transparent 72%),
    radial-gradient(560px 400px at 100% 70%, rgba(219, 221, 203, 0.15), transparent 64%),
    linear-gradient(180deg, #15375e 0%, #0d2949 42%, #071626 100%);
}

body,
#root {
  background: transparent !important;
  min-height: 100vh;
}

/* ═══ 浅海 token 层（默认档）：白玻璃 + 蓝调边框 ══════════════════════ */
html body {
  --dsw-alias-bg-base: rgba(255, 255, 255, 0.6) !important;
  --dsw-alias-bg-layer-1: #f6f9fd !important;
  --dsw-alias-bg-layer-2: #ecf2fa !important;
  --dsw-alias-bg-layer-3: #e1ebf7 !important;
  --dsw-alias-bg-overlay: #ffffff !important;
  --dsw-alias-bg-mask-1: rgba(10, 25, 50, 0.32) !important;
  --dsw-alias-bg-mask-2: rgba(10, 25, 50, 0.22) !important;
  --dsw-alias-border-l1: rgba(23, 58, 110, 0.10) !important;
  --dsw-alias-border-l2: rgba(23, 58, 110, 0.14) !important;
  --dsw-alias-border-l3: rgba(23, 58, 110, 0.22) !important;
  --dsw-alias-label-primary: #0c1a2e !important;
  --dsw-alias-label-secondary: #3d5270 !important;
  --dsw-alias-label-tertiary: #64789a !important;
  --dsw-alias-label-caption: #7d90aa !important;
  --dsw-specific-sidebar-fill: rgba(223, 233, 247, 0.78) !important;
  --dsw-specific-input-major: rgba(255, 255, 255, 0.72) !important;
  --dsw-specific-menu: rgba(255, 255, 255, 0.88) !important;
  --dsw-menu-surface-fill: rgba(255, 255, 255, 0.88) !important;
  --dsw-alias-button-floating-fill: rgba(255, 255, 255, 0.9) !important;
  --dsw-alias-button-floating-hover: rgba(255, 255, 255, 1) !important;
  --dsw-alias-button-elevated-fill: #f4f8fd !important;
  --dsw-alias-interactive-bg-hover: rgba(47, 84, 138, 0.08) !important;
  --dsw-alias-interactive-bg-active: rgba(47, 84, 138, 0.14) !important;
  --dsw-alias-interactive-bg-hover-solid: #e4edf8 !important;
  --dsw-alias-scrollbar-bg-l1: #c3d4ea !important;
  --dsw-alias-scrollbar-bg-l2: #b0c6e2 !important;
  --dsw-alias-scrollbar-hover-l1: #a2bbdb !important;
  --dsw-alias-scrollbar-hover-l2: #8badcf !important;
  /* tooltip / toast 必须是深底：这两处的文字色产品写死了 —— tooltip 组件里
   * 硬编码 color: var(--dsw-static-neutral-bluish-00)（= #fff，且没有对应的
   * label token 可覆盖），toast 的 --dsw-alias-toast-label 也指向同一个 #fff。
   * 0.1.0 把它们改成白玻璃 #ffffff，于是「白底 + 白字」——悬浮提示整片看不见，
   * 浅色档的 tab（对话/轨迹/上下文/编队）提示、以及顶部 toast 全部中招。
   * 这里回到产品原本的「深底白字」语义，取深海档同一支海军蓝 #16314f
   * （白字 13.2:1），两档工具提示同一身份，且无需碰任何类名哈希。 */
  --dsw-alias-tooltip-bg: #16314f !important;
  --dsw-alias-toast-bg: #16314f !important;
  /* toast 文字自己声明一份，与上面的深底成对锁死（产品默认指向 #fff，此处仍取近白） */
  --dsw-alias-toast-label: #f5f9ff !important;
  /* 编辑/写入 工具行的 ±行数：常显红绿（规则见结构层的 _diffAdded/_diffRemoved）。
   * 不直接用产品原绿 #22c55e——浅底只有 2.0:1（白底也才 2.3:1），11px 小字基本读不动；改用与正文
   * 行内代码同一支薄荷绿 #27793d（4.8:1），红取 #b3261e（5.8:1）。 */
  --sea-diff-add: #27793d;
  --sea-diff-del: #b3261e;
  --dsw-alias-bg-module-platform: #e6eef9 !important;
  --dsw-alias-markdown-code-block-banner: #eaf1f9 !important;
  /* 用户气泡（聊天/目标/用户提问三处共用 token）→ 淡azure蓝：
   * 在淡蓝画布上明显跳出（「这是我说的话」），现有深色文字/琥珀/薄荷全部兼容 */
  --dsw-specific-bubble: #cfe0fb !important;
  --dsw-specific-bubble-highlight: #a9c7f0 !important;
  /* 可点击卡片族（文件交付卡/变更卡/计划卡/日程卡）+ 工具 ioCard → 主题海军蓝阶梯：
   * fill = layer-1、悬停 = layer-2 整级提亮（官方手感）。0.12.14 修掉
   * [class*='details'] 误匹配后，此配色不再有「文件名色块」副作用 */
  --dsw-static-neutral-50: #f6f9fd !important;
  --dsw-static-neutral-100: #ecf2fa !important;
  --dsw-alias-markdown-code-block: #f6f9fd !important;
}

/* ═══ 深海 token 层：官方首页海军蓝一族（amber 强调保持不变） ═════════ */
body[data-ds-dark-theme] {
  --dsw-alias-bg-base: rgba(7, 19, 35, 0.72) !important;
  --dsw-alias-bg-layer-1: #0a1a30 !important;
  --dsw-alias-bg-layer-2: #102641 !important;
  --dsw-alias-bg-layer-3: #183653 !important;
  --dsw-alias-bg-overlay: #0f2744 !important;
  --dsw-alias-bg-mask-1: rgba(1, 7, 18, 0.74) !important;
  --dsw-alias-bg-mask-2: rgba(4, 13, 28, 0.54) !important;
  --dsw-alias-border-l1: rgba(210, 229, 255, 0.09) !important;
  --dsw-alias-border-l2: rgba(210, 229, 255, 0.15) !important;
  --dsw-alias-border-l3: rgba(231, 242, 255, 0.28) !important;
  --dsw-alias-label-primary: #f5f9ff !important;
  --dsw-alias-label-primary-inverted: #102641 !important;
  --dsw-alias-label-secondary: #c2d2e6 !important;
  --dsw-alias-label-tertiary: #8fa4bf !important;
  --dsw-alias-label-caption: #9eb2cc !important;
  --dsw-alias-markdown-code-block-banner: #0a1a30 !important;
  --dsw-alias-button-floating-fill: #122942 !important;
  --dsw-alias-button-floating-hover: #1f4066 !important;
  --dsw-alias-button-elevated-fill: #17314f !important;
  --dsw-alias-button-tool-bar-fill: #102641 !important;
  --dsw-alias-button-tool-bar-hover: #1a3454 !important;
  --dsw-alias-interactive-bg-hover: rgba(197, 220, 251, 0.10) !important;
  --dsw-alias-interactive-bg-active: rgba(209, 228, 253, 0.16) !important;
  --dsw-alias-interactive-bg-hover-solid: #1f4167 !important;
  --dsw-alias-scrollbar-bg-l1: #244361 !important;
  --dsw-alias-scrollbar-bg-l2: #345a7d !important;
  --dsw-alias-scrollbar-hover-l1: #5b7fa7 !important;
  --dsw-alias-scrollbar-hover-l2: #779ac1 !important;
  /* 两档同一支海军蓝：文字被产品写死为白（见浅海档同名条目），深底是唯一解 */
  --dsw-alias-tooltip-bg: #16314f !important;
  --dsw-alias-toast-bg: #16314f !important;
  /* ±行数：深底用亮一档的薄荷（与深色档行内代码同色）+ 产品红 400 */
  --sea-diff-add: #7fd88f;
  --sea-diff-del: #f25a5a;
  --dsw-alias-bg-module-platform: #183653 !important;
  /* 用户气泡 → 月光蓝：比深海画布亮两档、比白字暗两档，「这是我说的话」一眼定位 */
  --dsw-specific-bubble: #2a5089 !important;
  --dsw-specific-bubble-highlight: #345d9e !important;
  --dsw-specific-sidebar-fill: rgba(8, 24, 44, 0.82) !important;
  --dsw-specific-input-major: rgba(14, 32, 56, 0.72) !important;
  --dsw-specific-menu: rgba(16, 34, 58, 0.9) !important;
  --dsw-menu-surface-fill: rgba(16, 34, 58, 0.9) !important;
  /* 可点击卡片族 + 工具 ioCard → 主题海军蓝阶梯（fill = layer-1、hover = layer-2） */
  --dsw-static-neutral-850: #0a1a30 !important;
  --dsw-static-neutral-800: #102641 !important;
  --dsw-alias-markdown-code-block: #0a1a30 !important;
}

/* ═══ 分层结构（浅海默认 + 深海覆盖）：四级深度 ═══════════════════════
 * L1 侧栏（最暗/最浅的底）→ L2 会话画布（渐变）→ L3 输入卡（浮起）
 * → L4 弹窗（最高层玻璃）。每级都带发丝线边框 + 顶缘内发光 + 蓝黑阴影。 */

/* ── L1 侧栏 ── */
[class*='sidebarCol'] {
  background: rgba(240, 246, 252, 0.72) !important;
  border-color: rgba(23, 58, 110, 0.10) !important;
  box-shadow: inset -1px 0 rgba(255, 255, 255, 0.5), 20px 0 70px rgba(15, 40, 80, 0.08) !important;
}

body[data-ds-dark-theme] [class*='sidebarCol'] {
  background: linear-gradient(180deg, rgba(6, 20, 39, 0.72), rgba(3, 13, 27, 0.82)) !important;
  border-color: rgba(205, 224, 249, 0.14) !important;
  box-shadow: inset -1px 0 rgba(255, 255, 255, 0.045), 20px 0 70px rgba(0, 11, 30, 0.35) !important;
}

[class*='sidebarCol'] [class*='_root '],
[class*='sidebarCol'] [class$='_root'] {
  background-color: transparent !important;
  background-image: none !important;
}

/* ── L2 会话区：圆角与断层修复 ───────────────────────────────────────
 * 产品在 Windows 标题栏模式下的原生结构：frame 背景 = 侧栏色（sidebar-fill），
 * 会话列（centerCol）= bg-base + 左上 16px 圆角。原版两栏都是不透明且色差
 * 极小，圆角看不出来；主题把两栏都改半透明后「蓝条 vs 白板」色差被放大，
 * 圆角曲线显形。确定性修法：直接削平圆角，面板与顶部条带以直线相交。 */
[data-windows-titlebar] [class*='centerCol'] {
  border-radius: 0 !important;
}

[class*='home'],
[class*='Home'],
[class*='welcome'],
[class*='Welcome'] {
  background-color: transparent !important;
  background-image: none !important;
}

/* 面板内部的 _root 容器有实底（bg-layer token），清透明让画布统一成像 */
[class*='centerCol'] [class$='_root'] {
  background-color: transparent !important;
  background-image: none !important;
}

[class*='centerCol'] > *,
main > * {
  border-color: rgba(23, 58, 110, 0.08) !important;
}

body[data-ds-dark-theme] [class*='centerCol'] > *,
body[data-ds-dark-theme] main > * {
  border-color: rgba(215, 233, 255, 0.065) !important;
}

/* 输入区容器：去掉自带实底，与上方会话区同质（消除底部断层） */
[data-composer-seat] {
  background-color: transparent !important;
  background-image: none !important;
}

/* 文件交付卡的隐形预览按钮、行内文件提及/文件链接等「透明覆盖按钮」：
 * 全局按钮悬停 veil 已在 0.12.20 整体移除（它先后在三处误伤：交付卡、
 * 文件提及、文件链接芯片——像素实测 rgb(28,45,64) 均为同一层纱），
 * 悬停反馈完全交还产品原生的 token 化悬停样式，无需任何排除规则 */

/* ── L3 输入卡：浮在画布上的玻璃卡 ── */
[data-composer-seat] [class*='_card'],
[data-composer-seat] [class*='Card'] {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.94), rgba(238, 245, 252, 0.9)) !important;
  border-color: rgba(23, 58, 110, 0.14) !important;
  box-shadow: 0 12px 36px rgba(15, 40, 80, 0.12), inset 0 1px rgba(255, 255, 255, 0.9) !important;
}

body[data-ds-dark-theme] [data-composer-seat] [class*='_card'],
body[data-ds-dark-theme] [data-composer-seat] [class*='Card'] {
  color: #eef6ff !important;
  background: linear-gradient(145deg, #1f3654, #09192f) !important;
  border-color: rgba(225, 237, 255, 0.14) !important;
  box-shadow: 0 18px 48px rgba(0, 5, 18, 0.35), inset 0 1px rgba(255, 255, 255, 0.08) !important;
}

/* 侧栏「新会话」等浮动/抬升按钮：跟随海军蓝（深色档原先发灰的元凶） */
[class*='_logoRow'] > button[class*='_brand']:hover:not(:disabled) {
  background: transparent !important;
  border-color: transparent !important;
  box-shadow: none !important;
}

/* ── L4 弹窗 / 菜单 / 浮层：最高层玻璃 ── */
[role='dialog'],
[class*='popover'],
[role='menu'],
[class*='dropdown'] {
  background: rgba(255, 255, 255, 0.88) !important;
  border-color: rgba(23, 58, 110, 0.12) !important;
  box-shadow: 0 24px 70px rgba(15, 40, 80, 0.18), inset 0 1px rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(24px) saturate(130%);
  -webkit-backdrop-filter: blur(24px) saturate(130%);
}

body[data-ds-dark-theme] [role='dialog'],
body[data-ds-dark-theme] [class*='popover'],
body[data-ds-dark-theme] [role='menu'],
body[data-ds-dark-theme] [class*='dropdown'] {
  color: #eef6ff !important;
  background: linear-gradient(145deg, rgba(32, 55, 84, 0.82), rgba(12, 29, 51, 0.92)) !important;
  border-color: rgba(225, 237, 255, 0.14) !important;
  box-shadow: 0 24px 70px rgba(0, 5, 18, 0.42), inset 0 1px rgba(255, 255, 255, 0.07) !important;
}

/* 对话框头部：透明，让弹窗自身的玻璃统一成像（原先单独着色会产生分层色带） */
[role='dialog'] > [class$='_content'] > [class$='_header'] {
  background: transparent !important;
  border-color: rgba(23, 58, 110, 0.08) !important;
}

body[data-ds-dark-theme] [role='dialog'] > [class$='_content'] > [class$='_header'] {
  background: transparent !important;
  border-color: rgba(210, 230, 255, 0.12) !important;
}

/* 详情列（右侧面板）。只匹配 detailsCol——宽松的 [class*='details'] 会误杀
 * 一切模块里本地名叫 details 的容器（如文件交付卡的 .K5rwea_details 文件名区，
 * 其上晕出一片渐变深蓝，即 0.12.4–0.12.13「文件名底色」顽症的真凶） */
[class*='detailsCol'] {
  background: rgba(255, 255, 255, 0.78) !important;
  border-color: rgba(23, 58, 110, 0.12) !important;
  backdrop-filter: blur(20px) saturate(120%);
  -webkit-backdrop-filter: blur(20px) saturate(120%);
}

body[data-ds-dark-theme] [class*='detailsCol'] {
  background: linear-gradient(180deg, rgba(12, 32, 58, 0.82), rgba(5, 16, 31, 0.92)) !important;
  border-color: rgba(203, 223, 250, 0.14) !important;
}

/* ── 工具行的 +N / −N（编辑、写入…）常显红绿 ───────────────────────────
 * 产品规则（ToolRow.module.css）只在 :is(:hover, [aria-expanded=true]) 时才给
 * .diffAdded / .diffRemoved 上色，默认态跟着行文字一起发灰；一移开鼠标就失去
 * 「加了几行、删了几行」的语义。这里改成永远上色。
 * 加 !important 是为了把常态与悬浮态锁成同一支色——否则悬浮瞬间会被产品规则
 * 抢回去，绿/红突然亮一档。类名用 [class*='_diffAdded'] 匹配本地名（哈希前缀
 * hKdVjq_ 随构建变，本地名稳定），不碰具体哈希。 */
[class*='_diffAdded'] {
  color: var(--sea-diff-add) !important;
}

[class*='_diffRemoved'] {
  color: var(--sea-diff-del) !important;
}

/* ═══ 交互反馈：按压微沉（全局按钮悬停纱已于 0.12.20 移除——
 * 它先后在交付卡隐形按钮、文件提及、文件链接芯片三处误伤出框，
 * 产品按钮自有 token 化悬停样式（interactive-bg-hover 族，已随主题），
 * 全局纱是重复干扰源。0.12.0–0.12.19 的相关排除规则随之全部退役） ═══ */
button,
[role='button'] {
  transition: background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease, color 160ms ease;
}

button:active:not(:disabled),
[role='button']:active {
  transform: translateY(1px) scale(0.995);
}

/* 选中态导航 / 标签 */
[aria-selected='true']:not([role='tab']),
[aria-current='true'] {
  color: #0c1a2e !important;
  background: linear-gradient(135deg, rgba(96, 149, 212, 0.22), rgba(47, 84, 138, 0.18)) !important;
}

body[data-ds-dark-theme] [aria-selected='true']:not([role='tab']),
body[data-ds-dark-theme] [aria-current='true'] {
  color: #f7fbff !important;
  background: linear-gradient(135deg, rgba(97, 132, 171, 0.46), rgba(44, 79, 121, 0.42)) !important;
}

[role='tab'] {
  background: transparent !important;
  border-color: transparent !important;
  box-shadow: none !important;
}

button[role='tab']:hover:not(:disabled) {
  background: rgba(96, 149, 212, 0.10) !important;
}

body[data-ds-dark-theme] button[role='tab']:hover:not(:disabled) {
  background: rgba(105, 154, 218, 0.08) !important;
}

[role='tab']:focus-visible {
  outline-color: rgba(96, 149, 212, 0.5) !important;
  outline-offset: 3px;
}

/* 分隔条 hover：一道主题色细光 */
[class*='_splitRow_'] > [class*='_divider_']:hover::after {
  background: linear-gradient(to bottom, transparent, rgba(96, 149, 212, 0.30) 50%, transparent) center / 1px 100% no-repeat !important;
}

/* ═══ 深色档专属：输入控件文字 / 占位符 / 正文投影 / 代码块玻璃 ═══════ */
body[data-ds-dark-theme] textarea,
body[data-ds-dark-theme] input,
body[data-ds-dark-theme] select {
  color: #f5f9ff !important;
  caret-color: #d5e8ff;
}

body[data-ds-dark-theme] [class*='composer'] textarea,
body[data-ds-dark-theme] [class*='composer'] input {
  background: transparent !important;
  border-color: transparent !important;
}

body[data-ds-dark-theme] textarea::placeholder,
body[data-ds-dark-theme] input::placeholder {
  color: rgba(193, 208, 228, 0.72) !important;
}

/* 正文的暗色投影：在深蓝画布上托住可读性。只作用于 Markdown 容器本身——
 * text-shadow 会继承，若挂在消息行（flowItem）上，文件卡等子表面的文字
 * 也会带光晕，在卡片底色上晕出一片「渐变深蓝色块」（0.12.12 时代顽症的
 * 真凶：它不是背景色，background 探针照不到） */
body[data-ds-dark-theme] [class*='_markdown_'] {
  text-shadow: 0 1px 4px rgba(0, 7, 20, 0.72), 0 0 12px rgba(0, 7, 20, 0.38);
}

/* 代码块容器：浅色白玻璃 / 深色海军蓝玻璃（语法高亮配色不动） */
pre,
.md-code-block {
  overflow: hidden;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.92), rgba(238, 245, 252, 0.88)) !important;
  border: 1px solid rgba(23, 58, 110, 0.12) !important;
  border-radius: 16px;
  box-shadow: 0 10px 32px rgba(15, 40, 80, 0.10), inset 0 1px rgba(255, 255, 255, 0.9) !important;
}

body[data-ds-dark-theme] pre,
body[data-ds-dark-theme] .md-code-block {
  color: #eef6ff !important;
  background: linear-gradient(145deg, rgba(32, 52, 75, 0.82), rgba(12, 29, 51, 0.9)) !important;
  border: 1px solid rgba(224, 237, 255, 0.14) !important;
  box-shadow: 0 22px 56px rgba(0, 6, 20, 0.4), inset 0 1px rgba(255, 255, 255, 0.07) !important;
}

pre code,
code {
  color: inherit !important;
}

/* 行内代码配色完全交给 Markdown 层（浅色薄荷/翡翠、深色薄荷），此处不再覆盖——
 * 0.12.0 曾把深色行内代码改成官网蓝，与主题的薄荷绿身份冲突，0.12.3 移除。 */

/* 输入区装饰元素在深色下减淡 */
body[data-ds-dark-theme] [class*='composer']::before,
body[data-ds-dark-theme] [class*='composer']::after {
  opacity: 0.16 !important;
}
`

    /* ══════════════════════ 3) 总装 ══════════════════════ */

    function injectStyle(id, css) {
      try {
        if (document.getElementById(id)) return () => {}
        const tag = document.createElement('style')
        tag.id = id
        tag.dataset.plugin = 'dsh-ocean-theme'
        tag.textContent = css
        document.head.appendChild(tag)
        return () => {
          try { tag.remove() } catch { /* ignore */ }
        }
      } catch {
        return () => {}
      }
    }

    function apply(ctx) {
      ctx.effect(() => {
        const disposeMarkdown = injectStyle(MARKDOWN_STYLE_ID, MARKDOWN_CSS)
        const disposeTheme = injectStyle(THEME_STYLE_ID, THEME_CSS)
        return () => {
          disposeMarkdown()
          disposeTheme()
        }
      }, 'ocean-theme: markdown palette + deep-sea surface themes')
    }

    // 纯样式插件：不依赖任何 Client 服务。
    const inject = []

    exports.apply = apply
    exports.inject = inject
    return module.exports
  }
})
