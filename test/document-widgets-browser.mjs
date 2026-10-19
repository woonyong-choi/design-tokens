import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { CodeBlock, Tabs, Tooltip, trusted } from '../dist/ui/index.mjs';

if (!process.argv[2]) throw new Error('usage: node test/document-widgets-browser.mjs <playwright-core module> [screenshot prefix]');
const { chromium } = await import(pathToFileURL(resolve(process.argv[2])).href);
const root = fileURLToPath(new URL('../dist/', import.meta.url));
const code = String(CodeBlock({ code: trusted('<code>줄\r\n\t값 &lt;&gt;&amp;</code>') }));
const tabs = suffix => String(Tabs({ id: `shared-${suffix}`, platform: true, tabs: [{ label: 'Mac', body: trusted('<p>Mac 본문</p>') }, { label: 'Windows', body: trusted('<p>Windows 본문</p>') }] }));
const content = `<h1>합성 데이터: 네이티브 제목</h1><p data-native>네이티브 문단과 배경·폭 보존</p>${code}${tabs('first')}${tabs('later')}${Tooltip({ id: 'shared-tooltip', label: '설명', text: '합성 데이터: root 내부 설명' })}`;
const nativeCss = 'body { font-family: monospace; color: darkslategray; background: seashell; } section[data-root] { max-width: 90%; } #two { color: #f0f0f0; background: #303336; } h1 { font-size: 27px; } p { margin: 11px 0; }';
const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    if (pathname === '/' || pathname === '/auto') {
      const auto = pathname === '/auto';
      response.setHeader('Content-Type', 'text/html; charset=utf-8');
      response.end(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">${auto ? '<link rel="stylesheet" href="/tokens.css"><link rel="stylesheet" href="/styles.css">' : `<style>${nativeCss}</style><link rel="stylesheet" href="/styles/document-widgets.css">`}</head><body><section data-root id="one" data-widget-theme="light">${content}</section><section data-root id="two" data-widget-theme="dark">${content}</section><section id="outside">${code}</section>${auto ? '<script type="module" src="/ui/runtime/document.js"></script>' : ''}</body></html>`);
      return;
    }
    const path = resolve(root, `.${decodeURIComponent(pathname)}`);
    if (!path.startsWith(`${root.replace(/\/$/, '')}${sep}`)) { response.writeHead(403).end(); return; }
    response.setHeader('Content-Type', ['.js', '.mjs'].includes(extname(path)) ? 'text/javascript' : extname(path) === '.css' ? 'text/css' : 'font/woff2');
    response.end(await readFile(path));
  } catch { response.writeHead(404).end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const width of [320, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    const mounted = await page.evaluate(async () => {
      const { mountDocumentWidgets } = await import('/ui/runtime/document-widgets.js');
      const one = document.getElementById('one');
      const two = document.getElementById('two');
      const nativeStyles = () => [document.body, one, one.querySelector('h1'), one.querySelector('[data-native]'), two, two.querySelector('h1'), two.querySelector('[data-native]')].map(element => {
        const style = getComputedStyle(element);
        return ['fontFamily', 'fontSize', 'color', 'backgroundColor', 'width', 'margin'].map(name => style[name]);
      });
      const before = nativeStyles();
      const inert = !document.querySelector('.app-document-widgets');
      window.copies = [];
      window.liveListeners = [];
      const add = EventTarget.prototype.addEventListener;
      const remove = EventTarget.prototype.removeEventListener;
      let recording = true;
      EventTarget.prototype.addEventListener = function(type, callback, options) {
        if (recording) window.liveListeners.push({ target: this, type, callback, capture: typeof options === 'boolean' ? options : Boolean(options?.capture) });
        return add.call(this, type, callback, options);
      };
      EventTarget.prototype.removeEventListener = function(type, callback, options) {
        const capture = typeof options === 'boolean' ? options : Boolean(options?.capture);
        window.liveListeners = window.liveListeners.filter(item => !(item.target === this && item.type === type && item.callback === callback && item.capture === capture));
        return remove.call(this, type, callback, options);
      };
      window.disposeOne = mountDocumentWidgets(one, { platform: 'Mac', copyText: text => { window.copies.push(text); return new Promise(done => { window.finishCopy = done; }); } });
      window.disposeTwo = mountDocumentWidgets(two, { platform: 'Windows', copyText: text => { window.copies.push(text); } });
      recording = false;
      window.remount = () => mountDocumentWidgets(one, { copyText: text => window.copies.push(text) });
      let rejected = 0;
      for (const root of [one, one.querySelector('.app-code'), document]) try { mountDocumentWidgets(root); } catch { rejected++; }
      document.getElementById('outside').dispatchEvent(new CustomEvent('content-added', { detail: document.getElementById('outside'), bubbles: true }));
      return { before, after: nativeStyles(), inert, rejected };
    });
    assert.equal(mounted.inert, true, 'import has no DOM side effects');
    assert.equal(mounted.rejected, 3, 'duplicate and overlapping roots are rejected');
    assert.deepEqual(mounted.after, mounted.before, 'native font, colors, width, heading and paragraph styles are unchanged');
    assert.equal(await page.locator('#two [role=tab][aria-selected=true]').first().textContent(), 'Windows');
    await page.locator('#one [role=tab]').nth(1).click();
    assert.deepEqual(await page.locator('#one [role=tab][aria-selected=true]').allTextContents(), ['Windows', 'Windows']);
    await page.locator('#two [role=tab]').first().click();
    assert.deepEqual(await page.locator('#one [role=tab][aria-selected=true]').allTextContents(), ['Windows', 'Windows']);
    await page.locator('#one [role=tab]').nth(1).press('ArrowLeft');
    assert.deepEqual(await page.locator('#one [role=tab][aria-selected=true]').allTextContents(), ['Mac', 'Mac']);
    await page.locator('#two [data-tooltip-trigger]').click();
    assert.equal(await page.locator('#two .app-tooltip-bubble').evaluate(element => element.matches(':popover-open')), true);
    assert.equal(await page.locator('#one .app-tooltip-bubble').evaluate(element => element.matches(':popover-open')), false);
    await page.evaluate(html => {
      const two = document.getElementById('two');
      const added = document.createElement('div');
      added.innerHTML = html;
      two.append(added);
      for (let index = 0; index < 2; index++) two.dispatchEvent(new CustomEvent('content-added', { detail: added }));
      added.querySelector('[data-tool=copy]').click();
      document.querySelector('#outside [data-tool=copy]').click();
    }, code);
    await page.waitForFunction(() => window.copies.length === 1);
    if (process.argv[3]) await page.screenshot({ path: `${process.argv[3]}-${width}.png`, fullPage: true });
    await page.locator('#one [data-tool=copy]').click({ force: true });
    const disposed = await page.evaluate(async () => {
      window.disposeOne(); window.disposeOne();
      const one = document.getElementById('one');
      const before = one.outerHTML;
      window.finishCopy();
      await new Promise(done => setTimeout(done, 0));
      const unchanged = before === one.outerHTML;
      window.disposeTwo(); window.disposeTwo();
      return { unchanged, liveListeners: window.liveListeners.length, copies: window.copies };
    });
    assert.equal(disposed.unchanged, true, 'pending copy cannot update a disposed root');
    assert.equal(disposed.liveListeners, 0, 'all mounted listeners are removed');
    assert.deepEqual(disposed.copies, ['줄\n\t값 <>&', '줄\n\t값 <>&'], 'content-added is idempotent and outside widgets remain unbound');
    assert.equal(await page.locator('#two [data-tooltip-trigger]').getAttribute('popovertarget'), 'shared-tooltip', 'dispose restores the original tooltip target attribute');
    const last = await page.locator('#one [role=tab][aria-selected=true]').first().textContent();
    await page.locator('#one [role=tab]').nth(1).click();
    assert.equal(await page.locator('#one [role=tab][aria-selected=true]').first().textContent(), last, 'disposed tab listeners do not run');
    await page.evaluate(() => { window.disposeAgain = window.remount(); });
    await page.locator('#one [role=tab]').nth(1).click();
    assert.equal(await page.locator('#one [role=tab][aria-selected=true]').first().textContent(), 'Windows');
    await page.evaluate(() => window.disposeAgain());
    await page.goto(`http://127.0.0.1:${server.address().port}/auto?platform=Windows`);
    await page.waitForFunction(() => document.querySelector('#one [role=tab][aria-selected=true]')?.textContent === 'Windows');
    assert.equal(await page.locator('html').getAttribute('class'), null, 'legacy auto entry does not decorate the site root');
    assert.deepEqual(await page.locator('#one [role=tab][aria-selected=true]').allTextContents(), ['Windows', 'Windows']);
    await page.locator('#one [role=tab]').first().click();
    assert.deepEqual(await page.locator('#two [role=tab][aria-selected=true]').allTextContents(), ['Mac', 'Mac'], 'legacy automatic entry retains document-wide platform synchronization');
    console.log(`document widgets: ${width}px native roots, cleanup and site auto entry passed`);
    await page.close();
  }
} finally {
  await browser.close();
  await new Promise(done => server.close(done));
}
