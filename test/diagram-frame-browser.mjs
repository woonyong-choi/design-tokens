import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { after, test } from 'node:test';
import { DiagramFrame } from '../dist/ui/diagram.mjs';
import { values } from '../dist/tokens.js';

// 그림 틀의 판 크기 계약: 판 SVG는 자연 크기보다 커지지 않고, 가장 작은 글 역할이 가장 작은 글 토큰이 되는 배율 밑으로 줄지 않으며, 그보다 좁은 틀에서는 그림 영역 안에서만 가로로 옮긴다.
const modulePath = process.argv[2];
if (!modulePath) throw new Error('usage: node test/diagram-frame-browser.mjs <playwright-core module>');
const { chromium } = await import(pathToFileURL(resolve(modulePath)).href);
const root = fileURLToPath(new URL('../dist/', import.meta.url));
const smallestToken = Math.min(...Object.values(values.text.figure));
const smallestRole = values.text['figure-meta'];
const minimumScale = smallestToken / smallestRole;

// 합성 그림. 글 하나는 그림의 가장 작은 글 역할 크기다.
const panel = (width, height) => `<section class="dp-panel" style="--panel-w: ${width}"><svg xmlns="http://www.w3.org/2000/svg" class="fl" style="aspect-ratio: ${width} / ${height}" viewBox="0 0 ${width} ${height}" role="img"><title>합성 그림</title><text x="8" y="20" style="font-size: ${smallestRole}px">합성 글</text><rect x="${width - 20}" y="0" width="20" height="20" data-end/></svg></section>`;
const figures = {
  narrow: [[386, 240]],
  standard: [[960, 300]],
  wide: [[1600, 300], [800, 200]],
};
const documentFor = name => {
  const panels = figures[name];
  const view = Math.max(...panels.map(([width]) => width));
  const canvas = `<div class="dp-panels" style="--view-w: ${view}">${panels.map(([w, h]) => panel(w, h)).join('')}</div>`;
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/tokens.css"><link rel="stylesheet" href="/styles/tabs.css"><link rel="stylesheet" href="/styles/toolbar.css"><link rel="stylesheet" href="/styles/diagram/figure.css"><link rel="stylesheet" href="/styles/diagram/player.css"></head><body>${DiagramFrame({ canvas, labels: [] })}</body></html>`;
};

const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    const name = pathname.slice(1);
    if (Object.hasOwn(figures, name)) {
      response.setHeader('Content-Type', 'text/html; charset=utf-8');
      response.end(documentFor(name));
      return;
    }
    const path = resolve(root, `.${decodeURIComponent(pathname)}`);
    if (!path.startsWith(`${root.replace(/\/$/, '')}${sep}`)) { response.writeHead(403).end(); return; }
    response.setHeader('Content-Type', path.endsWith('.css') ? 'text/css' : 'font/woff2');
    response.end(await readFile(path));
  } catch { response.writeHead(404).end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const browser = await chromium.launch({ channel: 'chrome', headless: true });
after(async () => {
  await browser.close();
  await new Promise(done => server.close(done));
});

async function measure(width, name, isFull = false) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto(`http://127.0.0.1:${server.address().port}/${name}`);
  if (isFull) await page.evaluate(() => document.querySelector('.fl-figure').classList.add('full'));
  const layout = await page.evaluate(() => {
    const canvas = document.querySelector('.fl-canvas');
    return {
      pageWidth: document.documentElement.clientWidth,
      pageScrollWidth: document.documentElement.scrollWidth,
      canvasWidth: canvas.clientWidth,
      canvasScrollWidth: canvas.scrollWidth,
      overflowX: getComputedStyle(canvas).overflowX,
      panels: [...document.querySelectorAll('.dp-panel > svg')].map(svg => { const box = svg.getBoundingClientRect(); return { natural: svg.viewBox.baseVal.width, shown: box.width, center: box.left + box.width / 2 }; }),
    };
  });
  return { page, layout };
}

for (const width of [1280, 390, 320]) test(`diagram panels stay between the readable minimum and natural size at ${width}px`, async () => {
  for (const name of Object.keys(figures)) {
    const { page, layout } = await measure(width, name);
    try {
      assert.ok(layout.pageScrollWidth <= layout.pageWidth, `${name}: page must not scroll horizontally`);
      for (const { natural, shown } of layout.panels) {
        const scale = shown / natural;
        assert.ok(scale <= 1 + 1e-3, `${name}: panel ${natural} grows to ${shown}px`);
        assert.ok(scale >= minimumScale - 1e-3, `${name}: panel ${natural} shrinks to scale ${scale.toFixed(3)} below ${minimumScale.toFixed(3)}`);
      }
      const scales = layout.panels.map(({ natural, shown }) => shown / natural);
      assert.ok(Math.max(...scales) - Math.min(...scales) < 1e-3, `${name}: panels keep one scale`);
      const centers = layout.panels.map(({ center }) => center);
      assert.ok(Math.max(...centers) - Math.min(...centers) <= 1, `${name}: narrower panels stay centred over the widest panel`);
      if (layout.canvasScrollWidth > layout.canvasWidth) assert.equal(layout.overflowX, 'auto', `${name}: overflow is reachable inside the canvas`);
    } finally { await page.close(); }
  }
});

test('narrow figure keeps its natural size in a wide frame', async () => {
  const { page, layout } = await measure(1280, 'narrow');
  try { assert.equal(Math.round(layout.panels[0].shown), 386); } finally { await page.close(); }
});

test('wide figure scrolls inside the canvas by keyboard at 390px', async () => {
  const { page, layout } = await measure(390, 'wide');
  try {
    assert.ok(layout.canvasScrollWidth > layout.canvasWidth, 'wide figure overflows the canvas at the minimum scale');
    const canvas = page.locator('.fl-canvas');
    await canvas.focus();
    for (let press = 0; press < 200; press++) {
      if (await canvas.evaluate(element => element.scrollLeft + element.clientWidth >= element.scrollWidth - 1)) break;
      await page.keyboard.press('ArrowRight');
    }
    const end = await page.evaluate(() => {
      const box = document.querySelector('.fl-canvas').getBoundingClientRect();
      const mark = document.querySelector('[data-end]').getBoundingClientRect();
      return mark.right <= box.right + 1 && mark.left >= box.left - 1;
    });
    assert.equal(end, true, 'ArrowRight reaches the right edge of the widest panel');
  } finally { await page.close(); }
});

test('full screen keeps fit and zoom without the document minimum', async () => {
  const { page, layout } = await measure(320, 'wide', true);
  try { assert.ok(layout.panels[0].shown <= layout.canvasWidth + 1, 'full screen fits the widest panel to the area'); } finally { await page.close(); }
});
