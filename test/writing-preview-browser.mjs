import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { WritingPreview, DocumentArticle, CodeBlock, trusted } from '../dist/ui/index.mjs';

const modulePath = process.argv[2];
if (!modulePath) throw new Error('usage: node test/writing-preview-browser.mjs <playwright-core module> [screenshot prefix]');
const { chromium } = await import(pathToFileURL(resolve(modulePath)).href);
const root = fileURLToPath(new URL('../dist/', import.meta.url));
const title = `합성 데이터: 긴 제목 ${'아주긴단어'.repeat(30)}`;
const titleId = '한글-제목-앵커';
const code = CodeBlock({ code: trusted(`<code>long_identifier_${'x'.repeat(120)}</code>`) });
const body = trusted(`<p>본문 <a href="#note">각주</a></p>${code}<math display="block"><mi>x</mi><mo>=</mo><mn>1</mn></math><figure class="app-figure app-width-wide"><svg viewBox="0 0 680 100" role="img" aria-label="합성 데이터: 그림"><rect width="680" height="100" fill="currentColor"/></svg><figcaption>합성 데이터: 그림</figcaption></figure><ol class="footnotes"><li id="note">각주 내용</li></ol>`);
const writing = WritingPreview({ title, titleId, intro: trusted('<p>소개 <em>강조</em></p>'), body: trusted(`<p><a data-title-anchor href="#${encodeURIComponent(titleId)}">제목으로 이동</a> <a data-title-anchor href="#${titleId}">한글 주소로 이동</a></p>${body}`), statusLabel: '초안', tags: [{ label: '긴 태그 이름', href: '/tags/example/' }] });
const publication = DocumentArticle({ title, lead: trusted('소개'), metadata: trusted(''), body });
const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    if (pathname === '/') {
      response.setHeader('Content-Type', 'text/html; charset=utf-8');
      response.end(`<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="/tokens.css"><link rel="stylesheet" href="/styles.css"></head><body>${writing}<div data-publication>${publication}</div></body></html>`);
      return;
    }
    const path = resolve(root, `.${decodeURIComponent(pathname)}`);
    if (!path.startsWith(`${root.replace(/\/$/, '')}${sep}`)) { response.writeHead(403).end(); return; }
    response.setHeader('Content-Type', extname(path) === '.css' ? 'text/css' : 'font/woff2');
    response.end(await readFile(path));
  } catch { response.writeHead(404).end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const colorScheme of ['light', 'dark']) for (const width of [320, 390, 768, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme });
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    await page.evaluate(() => document.fonts.ready);
    const result = await page.evaluate(() => {
      const preview = document.querySelector('.app-writing-preview');
      const article = preview.querySelector('article');
      const published = document.querySelector('[data-publication] article');
      const properties = ['fontFamily', 'fontSize', 'lineHeight', 'color', 'backgroundColor', 'whiteSpace'];
      const styles = (root, selector) => Object.fromEntries(properties.map(name => [name, getComputedStyle(root.querySelector(selector))[name]]));
      return {
        width: preview.clientWidth, scrollWidth: preview.scrollWidth,
        titleWidth: article.querySelector('h1').clientWidth, titleScroll: article.querySelector('h1').scrollWidth,
        topMargin: getComputedStyle(article).marginTop, publicationMargin: getComputedStyle(published).marginTop,
        searchGap: getComputedStyle(published).getPropertyValue('--spacing-article-search-bottom').trim(),
        assets: ['code', 'math', 'figcaption', '.footnotes'].map(selector => [styles(article, selector), styles(published, selector)]),
      };
    });
    assert.ok(result.scrollWidth <= result.width, `preview overflow at ${width} ${colorScheme}`);
    assert.ok(result.titleScroll <= result.titleWidth, 'long title wraps');
    assert.equal(result.topMargin, '0px');
    assert.equal(parseFloat(result.publicationMargin), parseFloat(result.searchGap));
    for (const [actual, expected] of result.assets) assert.deepEqual(actual, expected, 'body asset styles remain shared');
    await page.locator('.app-writing-preview .app-tag').focus();
    assert.equal(await page.locator('.app-writing-preview .app-tag').evaluate(element => element.matches(':focus-visible')), true);
    for (const anchor of await page.locator('[data-title-anchor]').all()) {
      await anchor.click();
      assert.equal(decodeURIComponent(new URL(page.url()).hash.slice(1)), titleId);
      assert.equal(await page.locator('.app-writing-preview h1').evaluate(element => element.matches(':target')), true, 'encoded and decoded Unicode anchors resolve to the moved title');
    }
    const unsafeId = '한글"onmouseover="alert(1)\'&<앵커>';
    const attributes = await page.evaluate(html => {
      const heading = new DOMParser().parseFromString(html, 'text/html').querySelector('h1');
      return { id: heading.id, names: [...heading.attributes].map(attribute => attribute.name) };
    }, String(WritingPreview({ title, titleId: unsafeId, intro: trusted(''), body: trusted('') })));
    assert.equal(attributes.id, unsafeId, 'escaped attribute content round-trips without rewriting the ID');
    assert.deepEqual(attributes.names, ['class', 'id'], 'quotes and markup never create injected attributes');
    if (process.argv[3] && width === 390) await page.screenshot({ path: `${process.argv[3]}-${colorScheme}.png`, fullPage: true });
    console.log(`writing preview: ${width}px ${colorScheme} passed`);
    await page.close();
  }
} finally {
  await browser.close();
  await new Promise(done => server.close(done));
}
