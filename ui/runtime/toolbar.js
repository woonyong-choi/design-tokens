import { cssTimeMs } from './time.js';
import { ToolIcon } from '../toolbar.mjs';

/** 원문과 다운로드 작업만 소비자가 제공한다. 복사·결과 알림·재시도는 모든 블록이 공유한다. */
export function bindToolbar(root, { source, download, copyText } = {}) {
  if (copyText !== undefined && typeof copyText !== 'function') throw new TypeError('copyText must be a function');
  const doc = root.ownerDocument ?? document;
  const view = doc.defaultView ?? globalThis;
  const listeners = [];
  let disposed = false;
  const status = root.querySelector('[data-tool-status]');
  let timer;
  let shown;
  function clear() {
    view.clearTimeout(timer);
    if (!shown) return;
    shown.button.innerHTML = ToolIcon(shown.icon);
    shown.button.title = shown.title;
    delete shown.button.dataset.state;
    status.textContent = '';
    shown = undefined;
  }
  function announce(button, icon, ok, text) {
    clear();
    shown = { button, icon, title: button.title };
    button.innerHTML = ToolIcon(ok ? 'check' : 'alert');
    button.dataset.state = ok ? 'done' : 'failed';
    button.title = ok ? text : `${text}. 다시 시도하세요`;
    status.textContent = text;
    timer = view.setTimeout(clear, cssTimeMs(view.getComputedStyle(button).getPropertyValue('--duration-notice')));
  }
  async function copy(text) {
    if (copyText) return copyText(text);
    if (view.isSecureContext && view.navigator.clipboard?.writeText) {
      try { await view.navigator.clipboard.writeText(text); return true; } catch { /* 브라우저 복사 명령으로 다시 시도한다. */ }
    }
    if (disposed) return false;
    const holder = doc.createElement('textarea');
    holder.value = text;
    holder.readOnly = true;
    holder.className = 'app-copy-holder';
    holder.setAttribute('aria-hidden', 'true');
    holder.tabIndex = -1;
    const active = doc.activeElement;
    root.append(holder);
    holder.select();
    const onCopy = event => { event.clipboardData.setData('text/plain', text); event.preventDefault(); };
    doc.addEventListener('copy', onCopy, { once: true });
    try { return doc.execCommand('copy'); } catch { return false; }
    finally {
      doc.removeEventListener('copy', onCopy);
      holder.remove();
      active?.focus?.({ preventScroll: true });
    }
  }
  function bind(action, available, run, success) {
    const button = root.querySelector(`[data-tool="${action}"]`);
    if (!button) return;
    const wasHidden = button.hidden;
    listeners.push(() => { button.hidden = wasHidden; });
    button.hidden = !available;
    if (!available) return;
    const failure = action === 'copy' ? '복사하지 못했습니다' : '다운로드하지 못했습니다';
    let busy = false;
    const click = async () => {
      if (busy || disposed) return;
      busy = true;
      button.setAttribute('aria-disabled', 'true');
      try {
        const ok = await run();
        if (disposed) return;
        announce(button, action, ok !== false, ok === false ? failure : success);
      } catch {
        if (!disposed) announce(button, action, false, failure);
      } finally { busy = false; if (!disposed) button.removeAttribute('aria-disabled'); }
    };
    button.addEventListener('click', click);
    listeners.push(() => { button.removeEventListener('click', click); button.removeAttribute('aria-disabled'); });
  }
  bind('copy', source !== undefined, () => copy(typeof source === 'function' ? source() : source), '복사했습니다');
  bind('download', typeof download === 'function', download, '다운로드를 시작했습니다');
  return () => {
    if (disposed) return;
    disposed = true;
    clear();
    listeners.splice(0).forEach(remove => remove());
  };
}
