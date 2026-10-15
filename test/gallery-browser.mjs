import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { after, test } from 'node:test';

const modulePath = process.argv[2];
if (!modulePath) throw new Error('usage: node test/gallery-browser.mjs <playwright-core module> [screenshot path]');
const { chromium } = await import(pathToFileURL(resolve(modulePath)).href);
const screenshot = process.argv[3];
const root = fileURLToPath(new URL('../dist/', import.meta.url));
const assets = new Map([
  ['/tokens.css', 'text/css'],
  ['/styles/diagram/gallery.css', 'text/css'],
  ['/styles/diagram-embed.css', 'text/css'],
  ['/ui/runtime/diagram-host.js', 'text/javascript'],
]);
const host = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="/tokens.css"><link rel="stylesheet" href="/styles/diagram-embed.css"><link rel="stylesheet" href="/styles/diagram/gallery.css"></head><body><main><section><header><h2>합성 높이 검사</h2></header><iframe data-diagram src="/frame" title="합성 그림"></iframe></section></main><script type="module">import { bindDiagramHost } from '/ui/runtime/diagram-host.js'; bindDiagramHost();</script></body></html>`;
const child = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>body { margin: 0; } div { display: flex; align-items: flex-end; }</style></head><body><div id="content">합성 그림의 마지막 행</div><script>addEventListener('message', event => { if (event.data.theme) document.documentElement.dataset.theme = event.data.theme; });</script></body></html>`;
const server = createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  if (pathname === '/' || pathname === '/frame') {
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.end(pathname === '/' ? host : child);
    return;
  }
  if (!assets.has(pathname)) { response.writeHead(404).end(); return; }
  try {
    response.setHeader('Content-Type', assets.get(pathname));
    response.end(await readFile(resolve(root, `.${pathname}`)));
  } catch { response.writeHead(404).end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const browser = await chromium.launch({ channel: 'chrome', headless: true });
after(async () => {
  await browser.close();
  await new Promise(done => server.close(done));
});

// #207: 갤러리 초기 높이는 유효한 자연 높이와 전체화면 높이를 덮지 않는다.
for (const theme of ['light', 'dark']) for (const width of [320, 390, 430, 1440]) {
  test(`gallery_reported_height_and_fullscreen_${theme}_${width}`, async () => {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    try {
      await page.goto(`http://127.0.0.1:${server.address().port}/`);
      const frame = page.frames().find(item => item.url().endsWith('/frame'));
      const iframe = page.locator('iframe');
      await page.evaluate(value => { document.documentElement.dataset.theme = value; }, theme);
      await frame.waitForFunction(value => document.documentElement.dataset.theme === value, theme);
      assert.equal((await iframe.boundingBox()).height, 820);
      for (const height of [1200.5, 180]) {
        await frame.evaluate(value => {
          document.querySelector('#content').style.height = `${value}px`;
          parent.postMessage({ figureHeight: value }, location.origin);
        }, height);
        await page.waitForFunction(value => document.querySelector('iframe').height === String(Math.ceil(value)), height);
        assert.equal((await iframe.boundingBox()).height, Math.ceil(height));
        assert.ok(await frame.evaluate(() => document.querySelector('#content').getBoundingClientRect().bottom <= innerHeight));
        if (screenshot && theme === 'light' && width === 390 && height === 1200.5) {
          await page.screenshot({ path: screenshot, fullPage: true });
        }
      }
      await frame.evaluate(() => parent.postMessage({ figureFullscreen: true, figureHeight: 40 }, location.origin));
      await page.waitForFunction(() => document.querySelector('iframe').classList.contains('is-fullscreen'));
      assert.equal((await iframe.boundingBox()).height, 900);
      assert.equal(await iframe.getAttribute('height'), '180');
      await frame.evaluate(() => parent.postMessage({ figureFullscreen: false }, location.origin));
      await page.waitForFunction(() => !document.querySelector('iframe').classList.contains('is-fullscreen'));
      assert.equal((await iframe.boundingBox()).height, 180);
    } finally { await page.close(); }
  });
}
