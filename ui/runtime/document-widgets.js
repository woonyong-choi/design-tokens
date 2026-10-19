import { bindTabs } from './tabs.js';
import { bindToolbar } from './toolbar.js';

const mounts = new Set();

/** 지정한 본문의 위젯만 연결한다. 겹치는 mount는 거절하며 반환 함수로 정리한 뒤 재연결한다. */
export function mountDocumentWidgets(root, { copyText, platform } = {}) {
  if (!root?.querySelectorAll || !root.addEventListener || ![1, 9].includes(root.nodeType)) throw new TypeError('root must be an element or document');
  if (copyText !== undefined && typeof copyText !== 'function') throw new TypeError('copyText must be a function');
  if (platform !== undefined && typeof platform !== 'string') throw new TypeError('platform must be a string');
  for (const mounted of mounts) if (mounted === root || mounted.contains(root) || root.contains(mounted)) throw new Error('document widget roots must not overlap');
  const doc = root.ownerDocument ?? root;
  const view = doc.defaultView;
  if (!view) throw new TypeError('root must belong to a document with a window');
  const scope = root.nodeType === 1 ? root : undefined;
  const hadClass = scope?.classList.contains('app-document-widgets');
  const cleanup = [];
  const initialized = new WeakSet();
  let disposed = false;
  const on = (target, name, handler, options) => {
    target.addEventListener(name, handler, options);
    cleanup.push(() => target.removeEventListener(name, handler, options));
  };
  function initialize(fragment) {
    if (disposed) return;
    const find = selector => [...(fragment.matches?.(selector) ? [fragment] : []), ...fragment.querySelectorAll(selector)];
    for (const tabs of find('[data-tabs]')) {
      if (initialized.has(tabs)) continue;
      initialized.add(tabs);
      const container = tabs.querySelector(':scope > [role=tablist]');
      if (!container) continue;
      const panels = [...tabs.querySelectorAll(':scope > [role=tabpanel]')];
      const binding = bindTabs(container, index => {
        select(index);
        if (!tabs.hasAttribute('data-platform')) return;
        const later = [...root.querySelectorAll('[data-platform]')];
        later.slice(later.indexOf(tabs) + 1).forEach(next => next.dispatchEvent(new view.CustomEvent('platform-select', { detail: binding.buttons[index].textContent })));
      });
      cleanup.push(binding.dispose);
      function select(index) {
        binding.select(index);
        panels.forEach((panel, at) => { panel.hidden = at !== index; if (panel.hidden) panel.querySelectorAll('video').forEach(video => video.pause()); });
      }
      if (tabs.hasAttribute('data-platform')) {
        const selectPlatform = label => {
          if (typeof label !== 'string') return;
          const index = binding.buttons.findIndex(button => button.textContent.toLowerCase().includes(label.toLowerCase()));
          if (index >= 0) select(index);
        };
        on(tabs, 'platform-select', event => selectPlatform(event.detail));
        if (platform) selectPlatform(platform);
      }
    }
    for (const block of find('.app-code')) {
      if (initialized.has(block)) continue;
      initialized.add(block);
      cleanup.push(bindToolbar(block, { source: () => block.querySelector('code').textContent, copyText }));
    }
    for (const button of find('[data-tooltip-trigger]')) {
      if (initialized.has(button)) continue;
      const bubble = [...root.querySelectorAll('[id]')].find(element => element.id === button.getAttribute('popovertarget'));
      if (!bubble) continue;
      initialized.add(button);
      cleanup.push(bindTooltip({ root, button, bubble, view, on }));
    }
  }
  mounts.add(root);
  scope?.classList.add('app-document-widgets');
  try {
    initialize(root);
    on(root, 'content-added', event => {
      const fragment = event.detail;
      if (fragment?.querySelectorAll && (fragment === root || root.contains(fragment))) initialize(fragment);
    });
  } catch (error) { dispose(); throw error; }
  return dispose;

  function dispose() {
    if (disposed) return;
    disposed = true;
    cleanup.splice(0).reverse().forEach(remove => remove());
    mounts.delete(root);
    if (!hadClass) scope?.classList.remove('app-document-widgets');
  }
}

function bindTooltip({ root, button, bubble, view, on }) {
  const hasTarget = 'popoverTargetElement' in button;
  const previousTarget = button.popoverTargetElement;
  const previousAttribute = button.getAttribute('popovertarget');
  if (hasTarget) button.popoverTargetElement = bubble;
  const position = () => {
    const rect = button.getBoundingClientRect();
    const style = view.getComputedStyle(bubble);
    const gap = parseFloat(style.getPropertyValue('--spacing-gap-xs'));
    const width = parseFloat(style.width);
    bubble.style.setProperty('--anchor-x', `${rect.left + rect.width / 2 - width / 2}px`);
    const height = bubble.getBoundingClientRect().height;
    const top = rect.bottom + gap + height > view.innerHeight ? rect.top - gap - height : rect.bottom + gap;
    bubble.style.setProperty('--anchor-y', `${Math.max(gap, top)}px`);
  };
  const previous = ['--anchor-x', '--anchor-y'].map(name => [name, bubble.style.getPropertyValue(name)]);
  on(button, 'click', event => {
    position();
    if (!hasTarget) { event.preventDefault(); bubble.togglePopover(); }
  });
  on(bubble, 'toggle', event => { if (event.newState === 'open') position(); });
  on(view, 'resize', () => { if (bubble.matches(':popover-open')) position(); });
  on(view, 'scroll', event => { if ((event.target === root.ownerDocument || (event.target?.nodeType && root.contains(event.target))) && bubble.matches(':popover-open')) bubble.hidePopover(); }, true);
  return () => {
    if (bubble.matches(':popover-open')) bubble.hidePopover();
    if (hasTarget) {
      button.popoverTargetElement = null;
      if (previousAttribute === null) button.removeAttribute('popovertarget');
      else button.setAttribute('popovertarget', previousAttribute);
      if (previousAttribute === '') button.popoverTargetElement = previousTarget;
    }
    for (const [name, value] of previous) if (value) bubble.style.setProperty(name, value); else bubble.style.removeProperty(name);
  };
}
