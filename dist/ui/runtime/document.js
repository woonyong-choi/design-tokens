import { bindTabs } from './tabs.js';
import { bindToolbar } from './toolbar.js';

const initialized = new WeakSet();
function initContent(root) {
  // 정적 문서의 독립적인 상호작용을 연결한다. 갤러리의 장 선택은 공통 탭 처리(bindTabs)를 쓴다.
  for (const gallery of root.querySelectorAll('[data-tabs]')) {
    if (initialized.has(gallery)) continue;
    initialized.add(gallery);
    const panels = [...gallery.querySelectorAll(':scope > [role=tabpanel]')];
    bindTabs(gallery.querySelector(':scope > [role=tablist]'), (index) => {
      panels.forEach((panel, at) => { panel.hidden = at !== index; if (panel.hidden) panel.querySelectorAll('video').forEach((video) => video.pause()); });
    });
  }
  for (const block of root.querySelectorAll('.app-code')) {
    if (initialized.has(block)) continue;
    initialized.add(block);
    bindToolbar(block, { source: () => block.querySelector('code').textContent });
  }
  for (const button of root.querySelectorAll('[data-tooltip-trigger]')) {
    if (initialized.has(button)) continue;
    initialized.add(button);
    const bubble = document.getElementById(button.getAttribute('popovertarget'));
    if (!bubble) continue;
    const position = () => {
      const rect = button.getBoundingClientRect();
      const gap = parseFloat(getComputedStyle(bubble).getPropertyValue('--spacing-gap-xs'));
      const width = parseFloat(getComputedStyle(bubble).width);
      bubble.style.setProperty('--anchor-x', `${rect.left + rect.width / 2 - width / 2}px`);
      const height = bubble.getBoundingClientRect().height;
      const top = rect.bottom + gap + height > window.innerHeight ? rect.top - gap - height : rect.bottom + gap;
      bubble.style.setProperty('--anchor-y', `${Math.max(gap, top)}px`);
    };
    button.addEventListener('click', position);
    bubble.addEventListener('toggle', event => { if (event.newState === 'open') position(); });
    tooltips.add({ bubble, position });
  }
}
// 창 크기·스크롤 리스너는 툴팁마다 붙이지 않고 하나만 두며, 문서에서 빠진 툴팁은 함께 정리한다.
const tooltips = new Set();
function openTooltips() {
  for (const tooltip of tooltips) if (!tooltip.bubble.isConnected) tooltips.delete(tooltip);
  return [...tooltips].filter(({ bubble }) => bubble.matches(':popover-open'));
}
window.addEventListener('resize', () => { for (const { position } of openTooltips()) position(); });
window.addEventListener('scroll', () => { for (const { bubble } of openTooltips()) bubble.hidePopover(); }, { passive: true });
initContent(document);
document.addEventListener('content-added', event => initContent(event.detail));
