/**
 * dsh-ocean-theme — Host half.
 *
 * 全部逻辑在 Client 半边（lib/client.js）：向页面注入一份 Markdown 配色样式表
 * （琥珀 / 薄荷 / 青蓝三色，浅色/深色随 body[data-ds-dark-theme] 自适应）。
 * Host 侧不需要任何服务、工具或配置，保留空 apply 只是让加载器有一行可插入的 bundle。
 */
export const name = 'dsh-ocean-theme'

export function apply() {
  // no-op：配色完全发生在浏览器端，Host 侧无资源需要注册。
}
