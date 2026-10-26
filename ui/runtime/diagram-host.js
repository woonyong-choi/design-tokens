/** 등록된 도표 창과만 높이·테마·대체 전체화면을 주고받는다. */
export function bindDiagramHost() {
  // 같은 문서에서 두 번 불려도 리스너와 관찰자를 한 번만 붙인다. toString()으로 삽입되므로 모듈 변수 대신 전역 표시를 쓴다.
  const bound = Symbol.for('design-tokens.diagram-host');
  if (globalThis[bound]) return;
  globalThis[bound] = true;
  const selector = 'iframe[data-diagram]';
  const initialized = new WeakSet();
  const origin = globalThis.origin ?? location.origin;
  const target = origin === 'null' || location.protocol === 'file:' ? '*' : origin;
  const frames = () => [...document.querySelectorAll(selector)].filter(frame => new URL(frame.src, location.href).origin === location.origin);
  const theme = () => document.documentElement.dataset.theme ?? 'system';
  const sendTheme = frame => frame.contentWindow?.postMessage({ theme: theme() }, target);
  function initialize() {
    for (const frame of frames()) {
      if (initialized.has(frame)) continue;
      initialized.add(frame);
      frame.addEventListener('load', () => sendTheme(frame));
      sendTheme(frame);
    }
  }
  addEventListener('message', event => {
    if (event.origin !== origin || !event.data || typeof event.data !== 'object') return;
    const frame = frames().find(item => item.contentWindow === event.source);
    if (!frame) return;
    if (event.data.themeRequest === true) sendTheme(frame);
    if (typeof event.data.figureFullscreen === 'boolean') {
      frame.classList.toggle('is-fullscreen', event.data.figureFullscreen);
      document.documentElement.classList.toggle('has-fullscreen-diagram', Boolean(document.querySelector(`${selector}.is-fullscreen`)));
    }
    const height = event.data.figureHeight;
    if (!frame.classList.contains('is-fullscreen') && Number.isFinite(height) && height > 0) {
      frame.height = String(Math.ceil(height));
      frame.classList.add('has-diagram-height');
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    document.querySelector(`${selector}.is-fullscreen`)?.contentWindow?.postMessage({ figureExitFullscreen: true }, target);
  });
  new MutationObserver(() => frames().forEach(sendTheme))
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  document.addEventListener('content-added', initialize);
  initialize();
}
