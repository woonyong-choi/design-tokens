import test from 'node:test';
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { bindToolbar } from '../dist/ui/runtime/toolbar.js';
import { cssTimeMs } from '../dist/ui/runtime/time.js';
import { ToolIcon } from '../dist/ui/toolbar.mjs';
import { bindDiagramHost } from '../dist/ui/runtime/diagram-host.js';

function toolbar({ write, copyText, download, duration = '2400ms', source = '줄\r\n\t값 <>&' } = {}) {
  const buttons = Object.fromEntries(['copy', 'download'].map(action => [action, {
    dataset: {}, innerHTML: ToolIcon(action), attrs: {}, hidden: true,
    title: action === 'copy' ? '코드 복사' : 'HTML 다운로드',
    setAttribute(key, value) { this.attrs[key] = value; }, removeAttribute(key) { delete this.attrs[key]; },
    addEventListener(_, handler) { this.click = handler; },
    removeEventListener(_, handler) { if (this.click === handler) delete this.click; },
  }]));
  const status = { textContent: '' };
  const root = { querySelector: selector => selector === '[data-tool-status]' ? status : buttons[selector.match(/"(\w+)"/)[1]], append() {} };
  const timers = [];
  const document = { createElement: () => ({ setAttribute() {}, select() {}, remove() {} }), addEventListener() {}, removeEventListener() {}, execCommand: () => false };
  const dispose = runInNewContext(`(${bindToolbar.toString()})(root, options)`, {
    root, options: { source, download, copyText }, ToolIcon, cssTimeMs, document, isSecureContext: true,
    navigator: { clipboard: write ? { writeText: write } : undefined },
    getComputedStyle: () => ({ getPropertyValue: () => duration }),
    setTimeout: (callback, delay) => { const timer = { callback, delay }; timers.push(timer); return timer; }, clearTimeout(timer) { if (timer) timer.cleared = true; },
  });
  return { ...buttons, status, dispose, timers, reset: () => timers.at(-1).callback(), delay: () => timers.at(-1).delay };
}

test('shared_toolbar_waits_for_exact_copy_and_ignores_concurrent_clicks', async () => {
  const writes = []; let finish;
  const view = toolbar({ write: text => { writes.push(text); return new Promise(resolve => { finish = resolve; }); } });
  const pending = view.copy.click();
  await view.copy.click();
  assert.deepEqual(writes, ['줄\r\n\t값 <>&']);
  assert.equal(view.copy.dataset.state, undefined);
  assert.equal(view.copy.attrs['aria-disabled'], 'true');
  finish(); await pending;
  assert.equal(view.copy.dataset.state, 'done');
  assert.equal(view.status.textContent, '복사했습니다');
  assert.equal(view.copy.title, '복사했습니다');
  view.reset();
  assert.equal(view.copy.innerHTML, ToolIcon('copy'));
  assert.equal(view.status.textContent, '');
  assert.equal(view.copy.title, '코드 복사');
});

test('shared_toolbar_keeps_feedback_duration_after_css_minification', async () => {
  for (const duration of ['2400ms', ' 2.4s ']) {
    const view = toolbar({ write: async () => {}, duration });
    await view.copy.click();
    assert.equal(view.delay(), 2400);
  }
});

test('shared_toolbar_reports_failed_copy_and_allows_retry_without_false_success', async () => {
  let fail = true;
  const view = toolbar({ write: async () => { if (fail) throw Error('denied'); } });
  await view.copy.click();
  assert.equal(view.copy.dataset.state, 'failed');
  assert.equal(view.status.textContent, '복사하지 못했습니다');
  assert.equal(view.copy.title, '복사하지 못했습니다. 다시 시도하세요');
  fail = false; await view.copy.click();
  assert.equal(view.copy.dataset.state, 'done');
  assert.equal(view.copy.attrs['aria-disabled'], undefined);
  view.reset();
  assert.equal(view.copy.title, '코드 복사');
  const missing = toolbar(); await missing.copy.click();
  assert.equal(missing.copy.dataset.state, 'failed');
});

test('shared_toolbar_hides_unavailable_actions_and_announces_download_start', async () => {
  assert.equal(toolbar().download.hidden, true);
  const view = toolbar({ download: () => {} });
  assert.equal(view.download.hidden, false);
  await view.download.click();
  assert.equal(view.status.textContent, '다운로드를 시작했습니다');
  assert.equal(view.download.title, '다운로드를 시작했습니다');
  view.reset();
  assert.equal(view.download.title, 'HTML 다운로드');
  const failed = toolbar({ download: () => false });
  await failed.download.click();
  assert.equal(failed.status.textContent, '다운로드하지 못했습니다');
  assert.equal(failed.download.title, '다운로드하지 못했습니다. 다시 시도하세요');
});

test('bindToolbar_dispose_cancels_feedback_and_restores_controls', async () => {
  const view = toolbar({ copyText: async () => {} });
  await view.copy.click();
  assert.equal(view.copy.dataset.state, 'done');

  view.dispose();
  view.dispose();

  assert.equal(view.timers.at(-1).cleared, true);
  assert.equal(view.copy.click, undefined);
  assert.equal(view.copy.dataset.state, undefined);
  assert.equal(view.status.textContent, '');
  assert.equal(view.copy.title, '코드 복사');
});

test('bindToolbar_dispose_prevents_late_success_and_failure_from_mutating_dom', async () => {
  for (const rejects of [false, true]) {
    let finish;
    const copies = [];
    const view = toolbar({ copyText: text => { copies.push(text); return new Promise((resolve, reject) => { finish = rejects ? reject : resolve; }); } });
    const pending = view.copy.click();
    view.dispose();
    const before = JSON.stringify([view.copy, view.status]);

    finish();
    await pending;

    assert.deepEqual(copies, ['줄\r\n\t값 <>&']);
    assert.equal(JSON.stringify([view.copy, view.status]), before);
    assert.equal(view.timers.length, 0);
  }
});

test('diagram_host_limits_messages_to_its_frame_and_keeps_height_during_fullscreen', () => {
  const events = {}; const keys = {}; const classes = new Set(); const sent = [];
  const frame = { src: 'https://site.test/diagram.html', height: '480', contentWindow: { postMessage: data => sent.push(data) }, addEventListener() {},
    classList: { add: key => classes.add(key), toggle: (key, on) => on ? classes.add(key) : classes.delete(key), contains: key => classes.has(key) } };
  const document = { documentElement: { dataset: {}, classList: { toggle() {} } },
    querySelectorAll: () => [frame], querySelector: () => classes.has('is-fullscreen') ? frame : null,
    addEventListener: (name, fn) => { keys[name] = fn; } };
  runInNewContext(`(${bindDiagramHost.toString()})()`, { document, URL, location: { href: 'https://site.test/', origin: 'https://site.test', protocol: 'https:' },
    addEventListener: (name, fn) => { events[name] = fn; }, MutationObserver: class { observe() {} } });
  const send = data => events.message({ origin: 'https://site.test', source: frame.contentWindow, data });
  events.message({ origin: 'https://other.test', source: frame.contentWindow, data: { figureHeight: 1 } });
  events.message({ origin: 'https://site.test', source: {}, data: { figureHeight: 1 } });
  assert.equal(frame.height, '480');
  assert.equal(classes.has('has-diagram-height'), false);
  send({ figureFullscreen: true }); send({ figureHeight: 44 });
  assert.equal(frame.height, '480');
  keys.keydown({ key: 'Escape' }); assert.equal(sent.at(-1).figureExitFullscreen, true);
  send({ figureFullscreen: false }); send({ figureHeight: 512.5 });
  assert.equal(frame.height, '513');
  assert.equal(classes.has('has-diagram-height'), true);
  for (const height of [0, -1, NaN, Infinity, '512']) send({ figureHeight: height });
  assert.equal(frame.height, '513');
});



test('diagram_host_binds_listeners_once_per_document', () => {
  let listeners = 0; let observers = 0;
  const document = { documentElement: { dataset: {} }, querySelectorAll: () => [], addEventListener: () => { listeners++; } };
  const context = { document, URL, location: { href: 'https://site.test/', origin: 'https://site.test', protocol: 'https:' },
    addEventListener: () => { listeners++; }, MutationObserver: class { observe() { observers++; } } };
  runInNewContext(`(${bindDiagramHost.toString()})(); (${bindDiagramHost.toString()})()`, context);
  assert.equal(listeners, 3);
  assert.equal(observers, 1);
});
test('diagram_host_opaque_origin_keeps_registered_window_and_url_boundary', () => {
  const events = {}; const sent = [];
  const frame = { src: 'https://site.test/diagram.html', height: '128',
    contentWindow: { postMessage: (data, target) => sent.push({ data, target }) },
    addEventListener() {}, classList: { add() {}, contains: () => false } };
  const foreign = { ...frame, src: 'https://other.test/diagram.html', contentWindow: {} };
  const document = { documentElement: { dataset: { theme: 'dark' } },
    querySelectorAll: () => [frame, foreign], addEventListener() {} };
  runInNewContext(`(${bindDiagramHost.toString()})()`, { document, URL, origin: 'null',
    location: { href: 'https://site.test/preview', origin: 'https://site.test', protocol: 'https:' },
    addEventListener: (name, fn) => { events[name] = fn; }, MutationObserver: class { observe() {} } });
  assert.equal(sent[0].target, '*');
  assert.equal(sent[0].data.theme, 'dark');
  for (const [origin, source] of [['https://site.test', frame.contentWindow], ['null', {}], ['null', foreign.contentWindow]]) {
    events.message({ origin, source, data: { figureHeight: 900 } });
    assert.equal(frame.height, '128');
  }
  events.message({ origin: 'null', source: frame.contentWindow, data: { themeRequest: true, figureHeight: 412.5 } });
  assert.equal(frame.height, '413');
  assert.equal(sent.length, 2);
});
