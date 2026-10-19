import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import postcss from 'postcss';
import { mountDocumentWidgets } from '@woonyong-choi/design-tokens/runtime/document-widgets';
import { bindTabs } from '../dist/ui/runtime/tabs.js';

test('mountDocumentWidgets_import_is_inert_and_invalid_roots_fail_before_mount', () => {
  assert.equal(typeof mountDocumentWidgets, 'function');
  for (const root of [undefined, null, {}, []]) assert.throws(() => mountDocumentWidgets(root), /root must be/);
});

test('bindTabs_dispose_removes_click_and_keyboard_listeners', () => {
  const listeners = new Map();
  const button = { addEventListener: (name, fn) => listeners.set(`button-${name}`, fn), removeEventListener: name => listeners.delete(`button-${name}`), setAttribute() {} };
  const container = { querySelectorAll: () => [button], addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: name => listeners.delete(name) };
  const binding = bindTabs(container, () => {});
  assert.equal(listeners.size, 2);

  binding.dispose();
  binding.dispose();

  assert.equal(listeners.size, 0);
});

test('document_widget_styles_are_scoped_and_preserve_native_prose', () => {
  const css = readFileSync(new URL(import.meta.resolve('@woonyong-choi/design-tokens/styles/document-widgets.css')), 'utf8');
  const ast = postcss.parse(css);

  ast.walkRules(rule => {
    for (const selector of rule.selectors) assert.match(selector, /^(?:\.app-document-widgets |:where\(\.app-document-widgets)/);
    assert.doesNotMatch(rule.selector, /app-prose|app-blog|app-feature|app-document-layout|:root|\bbody\b|\bhtml\b/);
    if (rule.selector.startsWith(':where(')) for (const declaration of rule.nodes) assert.ok(declaration.prop.startsWith('--'));
  });
  assert.doesNotMatch(css, /@font-face|prefers-color-scheme|app-diagram|has-fullscreen-diagram/);
  for (const widget of ['app-code', 'app-tablist', 'app-tooltip-bubble', 'footnotes', 'katex-display']) assert.ok(css.includes(widget));
});
