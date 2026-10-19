import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { WritingPreview, DocumentArticle, SectionIntro, trusted } from '../dist/ui/index.mjs';

const content = { title: '제목 <script> &', intro: trusted('<p>소개 <em>강조</em></p>'), body: trusted('<pre class="app-code"><code>const x = 1;</code></pre><sup><a href="#note">1</a></sup><math><mi>x</mi></math><figure class="app-figure app-width-wide"><img src="/figure.svg" alt="그림"></figure>') };

test('WritingPreview_escapes_text_and_reuses_tag_links_without_site_chrome', () => {
  const html = String(WritingPreview({ ...content, statusLabel: '초안 <b>&', tags: [{ label: '태그 <', href: '/tags/?a=1&b=2' }] }));

  assert.match(html, /제목 &lt;script&gt; &amp;/);
  assert.match(html, /초안 &lt;b&gt;&amp;/);
  assert.match(html, /<a class="app-tag" href="\/tags\/\?a=1&amp;b=2">태그 &lt;<\/a>/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.doesNotMatch(html, /<nav\b|<footer\b|<time\b|app-header|app-footer|app-logo|app-landing-social|giscus/);
  assert.ok(html.includes('<div class="app-article-lead app-document-lead app-prose"><p>소개 <em>강조</em></p></div>'));
  assert.ok(html.includes(`<div class="app-prose app-document-body">${content.body}</div>`));
});

test('WritingPreview_rejects_untrusted_slots_and_unsafe_tag_urls', () => {
  assert.throws(() => WritingPreview({ ...content, intro: '<p>raw</p>' }), /lead must be trusted/);
  assert.throws(() => WritingPreview({ ...content, body: '<p>raw</p>' }), /body must be trusted/);
  assert.throws(() => WritingPreview({ ...content, tags: [{ label: 'tag', href: 'javascript:alert(1)' }] }), /Unsupported URL/);
  assert.doesNotMatch(String(WritingPreview(content)), /<time|class="app-tag"|app-document-dates/);
});

test('DocumentArticle_default_publication_markup_stays_unchanged', () => {
  const html = String(DocumentArticle({ title: 'Title', lead: trusted('Lead'), metadata: trusted('Meta'), body: trusted('Body') }));

  assert.equal(html, '<article class="app-document"><header class="app-document-header"><h1 class="app-article-title">Title</h1></header><p class="app-article-lead app-document-lead">Lead</p><div class="app-document-metadata">Meta</div><div class="app-prose app-document-body">Body</div></article>');
});

test('WritingPreview_preserves_the_moved_title_anchor_and_checks_ids', () => {
  const html = String(WritingPreview({ ...content, titleId: 'original-heading_1', body: trusted('<p><a href="#original-heading_1">제목으로 이동</a></p>') }));

  assert.match(html, /<h1 class="app-article-title" id="original-heading_1">/);
  assert.match(html, /href="#original-heading_1"/);
  assert.equal((html.match(/id="original-heading_1"/g) || []).length, 1);
  assert.equal(String(WritingPreview({ ...content, titleId: undefined })), String(WritingPreview(content)));
  for (const titleId of ['', null, false, 0, 1, {}, [], 'bad id', '" onmouseover="alert(1)', 'bad\u0000id', 'bad\u007fid', 'bad\u0085id', 'bad\u200bid', 'bad\u00a0id']) {
    assert.throws(() => WritingPreview({ ...content, titleId }), { name: 'TypeError', message: /^invalid title id:/ });
  }
});

test('WritingPreview_accepts_document_engine_unicode_heading_ids_without_changing_general_ids', () => {
  const html = String(WritingPreview({ ...content, titleId: '한글-제목-앵커' }));

  assert.match(html, /<h1 class="app-article-title" id="한글-제목-앵커">/);
  assert.throws(() => SectionIntro({ id: '한글-제목-앵커', title: '제목' }), /Invalid id:/);
  const escaped = String(WritingPreview({ ...content, titleId: '한글"\'&<앵커>' }));
  assert.match(escaped, /id="한글&quot;&#39;&amp;&lt;앵커&gt;"/);
});

test('WritingPreview_spacing_is_scoped_and_body_styles_are_shared', () => {
  const css = readFileSync(new URL('../styles/article.css', import.meta.url), 'utf8');

  assert.match(css, /\.app-document \{[^}]*margin: var\(--spacing-article-search-bottom\) auto 0/);
  assert.match(css, /\.app-document-layout \{[^}]*margin-top: var\(--spacing-article-search-bottom\)/);
  assert.match(css, /\.app-document\.is-writing \{[^}]*margin-top: 0/);
  assert.doesNotMatch(css, /is-writing[^{}]*(?:app-code|math|app-figure|footnote)/);
});
