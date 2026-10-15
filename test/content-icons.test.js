import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { test } from 'node:test';
import { buildDesign } from '../scripts/lib/design-build.mjs';
import { getIconCatalog, iconFile, readIcon } from '../dist/ui/build/icons.mjs';
import { parseIconSvg, renderSvgIcon, iconBody } from '../dist/ui/svg.mjs';
import { ContentIcon, ControlIcon, ArticleIcon, SocialIcon, trusted } from '../dist/ui/index.mjs';

const root = new URL('../', import.meta.url).pathname;
const files = buildDesign(root);
const catalog = getIconCatalog();

test('semantic_catalog_covers_every_svg_once_at_two_levels', () => {
  const source = readdirSync(root + 'assets/icons', { recursive: true }).filter(name => name.endsWith('.svg')).sort();
  assert.deepEqual(Object.values(catalog.icons).map(icon => icon.file).sort(), source);
  assert.equal(new Set(source).size, source.length);
  assert.equal(source.some(name => name.split('/').length !== 2), false);
  for (const [name, icon] of Object.entries(catalog.icons)) {
    assert.ok(Object.hasOwn(catalog.categories, icon.category), name);
    const raw = readFileSync(root + 'assets/icons/' + icon.file, 'utf8');
    const output = files['assets/icons/' + icon.file].toString();
    // 브랜드 고유색과 SVG 좌표는 원본 데이터이고 테마 색은 변수로 공급한다.
    if (!Object.hasOwn(catalog.brands, name)) assert.doesNotMatch(raw, /(?:fill|stroke|color)=["']#[0-9a-f]/i, icon.file);
    assert.doesNotMatch(output, /var\(|undefined|NaN/, icon.file);
    assert.doesNotThrow(() => parseIconSvg(output), icon.file);
  }
  assert.equal(Object.keys(files).some(name => /assets\/controls|catalog-detail|current-review/.test(name)), false);
});

test('independent_png_icons_preserve_image_paths_dimensions_and_provenance', () => {
  const names = ['icons/communication/newsletter.png', 'icons/communication/testimonials.png'];
  assert.deepEqual(Object.keys(files).filter(name => name.startsWith('assets/icons/') && name.endsWith('.png')).sort(), names.map(name => `assets/${name}`));
  const sources = JSON.parse(readFileSync(root + 'assets/sources.json', 'utf8'));
  for (const name of names) {
    const source = readFileSync(root + 'assets/' + name);
    const provenance = sources.find(asset => asset.file === name);
    const hash = createHash('sha256').update(source).digest('hex');
    assert.equal(provenance?.origin, 'project-original', name);
    assert.equal(provenance.license, 'MIT', name);
    assert.equal(provenance.sha256, hash, name);
    assert.equal(provenance.bytes, source.length, name);
    assert.notEqual(provenance.previousSource.sha256, hash, name);
    assert.match(provenance.previousSource.url, /^https:\/\/culturedcode\.com\//, name);
    assert.equal(provenance.previousSource.use, 'comparison-only', name);
    assert.equal(provenance.url, undefined, name);
    assert.deepEqual(files['assets/' + name], source, name);
    assert.equal(source.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', name);
    assert.deepEqual([source.readUInt32BE(16), source.readUInt32BE(20)], [128, 128], name);
    assert.equal(source[25], 6, name);
    assert.equal(Object.values(catalog.icons).some(icon => icon.file === name.slice(6)), false, name);
  }
});

test('loader_resolves_aliases_and_variants_without_accepting_paths', () => {
  for (const [alias, target] of Object.entries(catalog.aliases)) assert.equal(iconFile(alias), iconFile(target));
  assert.equal(iconFile('copy', { variant: 'detail' }), 'programming/copy-detail.svg');
  assert.equal(iconFile('file-copy', { variant: 'detail' }), iconFile('file-copy'));
  for (const name of ['missing', '../copy', 'constructor', '__proto__']) assert.throws(() => readIcon(name), /unknown icon/);
  assert.throws(() => iconFile('copy', { variant: 'small' }), /unknown icon variant/);
  for (const library of catalog.libraries) assert.ok(files['assets/icons/' + library.notice], library.name);
  for (const [name, brand] of Object.entries(catalog.brands)) {
    assert.ok(catalog.icons[name], name);
    assert.match(brand.source, /^https:\/\//);
    assert.ok(catalog.libraries.some(library => library.name === brand.library));
  }
});

test('static_svg_rejects_active_or_broken_content', () => {
  const wrap = body => `<svg viewBox="0 0 24 24">${body}</svg>`;
  for (const body of ['<script/>', '<image href="https://example.com/x"/>', '<path d="M0 0" onload="x"/>', '<style/>', '<rect mask="url(https://example.com/m)"/>', '<rect mask="url(#missing)"/>', '<g id="x"/><g id="x"/>', '<g></path>']) assert.throws(() => parseIconSvg(wrap(body)), body);
  assert.throws(() => parseIconSvg('<svg viewBox="0 0 1e999 24"/>'), /viewBox/);
  assert.throws(() => renderSvgIcon(wrap('<path d="M0 0"/>'), { className: 'x" onload="x' }), /invalid icon class/);
});

test('repeated_masked_icons_keep_cutouts_and_separate_ids', () => {
  const source = '<svg viewBox="0 0 32 16" fill="#123456"><defs><mask id="cut"><rect width="32" height="16" fill="white"/><circle cx="8" cy="8" r="2" fill="black"/></mask></defs><rect width="32" height="16" mask="url(#cut)"/></svg>';
  const first = iconBody(source, { size: 24, prefix: 'first', monochrome: true });
  const second = iconBody(source, { size: 24, prefix: 'second', monochrome: true });
  assert.match(first, /translate\(0 6\) scale\(0.75\)/);
  assert.match(first, /id="first-cut"/);
  assert.match(first, /mask="url\(#first-cut\)"/);
  assert.match(second, /mask="url\(#second-cut\)"/);
  assert.doesNotMatch(second, /first-cut/);
  assert.match(first, /fill="white"/);
  assert.match(first, /fill="black"/);
  assert.match(first, /fill="currentColor"/);
  assert.notEqual(renderSvgIcon(source), renderSvgIcon(source));
});

test('color_surfaces_and_monochrome_cutouts_keep_separate_presentations', () => {
  // #135: 컬러의 불투명 종이면을 단색 변환 때문에 투명하게 만들지 않는다.
  const source = '<svg viewBox="0 0 24 24"><g data-name="color"><rect id="paper" width="24" height="24" fill="white"/><path d="M4 8H20" stroke="#a5a7a9"/></g><g data-name="monochrome" display="none"><defs><mask id="cut"><rect width="24" height="24" fill="white"/><path d="M4 8H20" stroke="black"/></mask></defs><rect width="24" height="24" mask="url(#cut)"/></g></svg>';
  for (const render of [options => renderSvgIcon(source, options), options => iconBody(source, { size: 24, ...options })]) {
    const color = render({ prefix: 'color' });
    assert.match(color, /id="color-paper"[^>]*fill="white"/);
    assert.match(color, /stroke="#a5a7a9"/);
    assert.doesNotMatch(color, /<mask|display=|data-name=/);
    const mono = render({ prefix: 'mono', monochrome: true });
    assert.match(mono, /mask="url\(#mono-cut\)"/);
    assert.match(mono, /stroke="black"/);
    assert.match(mono, /fill="currentColor"/);
    assert.doesNotMatch(mono, /paper|#a5a7a9|display=|data-name=/);
    assert.doesNotThrow(() => parseIconSvg(mono.startsWith('<svg ') ? mono : `<svg viewBox="0 0 24 24">${mono}</svg>`));
  }
});

test('presentation_variants_reject_partial_hidden_or_cross_referenced_content', () => {
  const color = '<g data-name="color"><rect width="24" height="24"/></g>';
  const mono = '<g data-name="monochrome" display="none"><path d="M4 8H20"/></g>';
  for (const body of [
    color, mono, color + color + mono, `<g>${color}${mono}</g>`,
    color + mono + '<circle r="4"/>', color + mono.replace('display="none"', 'display="inline"'),
    color.replace('data-name="color"', 'data-name="color" display="none"') + mono,
    '<g display="none"><rect width="24" height="24"/></g>',
    color + mono.replace('<path d="M4 8H20"/>', '<script/>'),
    color + mono.replace('<path d="M4 8H20"/>', '<image href="https://example.com/x"/>'),
    color.replace('<rect width="24" height="24"/>', '<defs><mask id="shared"><rect width="24" height="24"/></mask></defs>') + mono.replace('<path d="M4 8H20"/>', '<rect mask="url(#shared)"/>'),
  ]) assert.throws(() => parseIconSvg(`<svg viewBox="0 0 24 24">${body}</svg>`), body);
});

test('shared_components_render_catalog_roles_and_validate_graphic_slots', () => {
  // #135: 글 형식의 공통 이름은 합의한 대표 그래픽 하나로 연결된다.
  assert.deepEqual(catalog.kinds, {
    concept: 'document', architecture: 'hierarchy', experiment: 'flask',
    troubleshooting: 'bug', build: 'code-block', review: 'code-review',
    retrospective: 'change-history', project: 'briefcase',
  });
  for (const [group, render] of [['controls', ControlIcon], ['articles', ArticleIcon], ['social', SocialIcon]]) {
    for (const name of Object.keys(catalog[group])) assert.match(String(render(name)), /<svg[^>]*aria-hidden="true"/);
    assert.throws(() => render('missing'), /unknown/);
  }
  const graphic = trusted(renderSvgIcon(readIcon('database')));
  const badge = trusted(renderSvgIcon(readIcon(catalog.kinds.experiment)));
  assert.match(String(ContentIcon({ graphic, badge })), /app-content-icon-badge/);
  assert.doesNotMatch(String(ContentIcon({ graphic })), /app-content-icon-badge/);
  assert.throws(() => ContentIcon({ graphic, badge: '<svg/>' }), /must be trusted/);
  const runtime = files['ui/icon-data.mjs'].toString();
  assert.ok(runtime.length < Object.values(catalog.icons).reduce((sum, icon) => sum + files['assets/icons/' + icon.file].length, 0) / 10);
});

test('media_controls_preserve_white_symbols_and_inherit_button_color', () => {
  for (const name of ['play', 'video-play', 'pause']) {
    const svg = String(ControlIcon(name));
    assert.match(svg, /<circle[^>]*fill="currentColor"/);
    assert.match(svg, /<(?:path|rect)[^>]*fill="#fff(?:fff)?"/);
    assert.doesNotMatch(svg, /<svg[^>]*\scolor=/);
  }
  assert.doesNotMatch(String(ControlIcon('copy')), /fill="#fff(?:fff)?"/);
});
