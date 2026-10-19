import postcss from 'postcss';
import { resolveValue } from './token-css.mjs';

const WIDGET = /\.(?:app-(?:tabs|tablist|tabpanel|code|syntax-[\w-]+|tool[\w-]*|sr|copy-holder)\b|footnotes\b|footnotes-sep\b|footnote-(?:item|ref|backref)\b|katex-(?:block|display|error)\b)/;
const SCOPE = '.app-document-widgets';

/** 기존 공통 규칙만 선택·범위 지정한다. native 본문 기본값과 사이트 배치는 포함하지 않는다. */
export function documentWidgetStyles(css, tables) {
  const ast = postcss.parse(css);
  ast.walkRules(rule => {
    const selectors = rule.selectors.filter(selector => WIDGET.test(selector));
    if (rule.selector === '[hidden]') selectors.push('[role=tabpanel][hidden]');
    if (!selectors.length) { rule.remove(); return; }
    rule.selectors = selectors.map(selector => `${SCOPE} ${selector.replace(/\.app-prose\s+/g, '')}`);
  });
  ast.walkComments(comment => comment.remove());
  ast.walkAtRules(rule => {
    if (rule.name !== 'media' && rule.name !== 'supports') rule.remove();
  });
  ast.walkAtRules(rule => { if (!rule.nodes?.some(node => node.type === 'rule' || node.type === 'atrule')) rule.remove(); });
  const styles = ast.toString();
  const names = new Set([...`${styles} --duration-notice`.matchAll(/--[a-zA-Z][\w-]*/g)].map(match => match[0]));
  const declarations = mode => {
    const keys = new Map([...tables[mode].keys()].map(key => [`--${key.replaceAll('.', '-')}`, key]));
    return [...names].filter(name => keys.has(name)).map(name => `  ${name}: ${resolveValue(tables[mode], keys.get(name))};`).join('\n');
  };
  return `/* tokens/tokens.json + styles/: 생성물, 손으로 고치지 않음 */\n:where(${SCOPE}) {\n${declarations('light')}\n}\n:where(${SCOPE}[data-widget-theme="dark"]) {\n${declarations('dark')}\n}\n${styles}\n`;
}
