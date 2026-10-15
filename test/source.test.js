import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { test } from 'node:test';
import { buildDesign } from '../scripts/lib/design-build.mjs';
import { buildTables, flattenTokens, resolveToken, readSource } from '../scripts/lib/tokens.mjs';
import { themeTable, resolveValue } from '../scripts/lib/token-css.mjs';
import { ROOT, tables } from './helpers.mjs';
import { verifyDesign } from '../scripts/lib/verify-dist.mjs';

test('one_source_owns_web_and_diagram_roles_without_theme_hierarchy', () => {
  assert.equal(existsSync(`${ROOT}themes`), false);
  for (const name of tables.light.keys()) assert.doesNotMatch(name, /^(?:site|space|size|weight|easing)\./);
  assert.equal(resolveValue(tables.light, 'spacing.4'), '16px');
});

test('unknown_references_cycles_css_collisions_and_invalid_dark_overrides_fail', () => {
  const token = value => ({ $type: 'color', $value: value });
  assert.throws(() => themeTable({ a: token('{b}'), b: token('{a}') }), /cycle/);
  assert.throws(() => themeTable({ a: token('{missing}') }), /unknown/);
  assert.throws(() => themeTable({ a: { b: token('#fff') }, 'a-b': token('#fff') }), /collision/);
  assert.throws(() => buildTables({ light: { a: token('#fff') }, dark: { b: token('#000') } }), /missing/);
  assert.throws(() => resolveToken(flattenTokens({ a: token('{a}') }), 'a'), /cycle/);
});

test('diagram_colors_share_the_things_category_palette_in_both_modes', () => {
  const anchors = ['#1e6bd6', '#f2d024', '#fa1955', '#269c6e'];
  for (const table of [tables.light, tables.dark]) {
    anchors.forEach((color, index) => assert.equal(resolveValue(table, `color.category.${['blue', 'yellow', 'red', 'green'][index]}.fill`), color));
    for (const name of table.keys()) assert.doesNotMatch(name, /^color\.(?:blue|red|green|purple|orange)\.|^color\.data\.category-(?:on-)?area\./);
  }
});

test('all_generated_files_match_the_single_source_and_manifest', () => {
  const generated = buildDesign(ROOT);
  for (const [name, value] of Object.entries(generated)) assert.ok(readFileSync(`${ROOT}dist/${name}`).equals(Buffer.from(value)), name);
  assert.equal(verifyDesign(`${ROOT}dist`).contentHash, JSON.parse(generated['manifest.json']).contentHash);
});

test('both_modes_keep_references_and_generated_token_modules_are_identified', () => {
  const css = readFileSync(`${ROOT}dist/tokens.css`, 'utf8');
  assert.equal((css.match(/--spacing-4:/g) ?? []).length, 1, 'shared spacing is defined once and modes only override differences');
  assert.match(css, /data-theme='light'/);
  assert.match(css, /data-theme='dark'/);
  for (const name of ['tokens.css', 'tokens.js']) assert.match(readFileSync(`${ROOT}dist/${name}`, 'utf8').split('\n')[0], /생성물, 손으로 고치지 않음/);
});


test('web_corner_radii_do_not_borrow_spacing_tokens', () => {
  for (const file of ['cards', 'controls', 'shell', 'landing']) {
    const css = readFileSync(`${ROOT}styles/${file}.css`, 'utf8');
    assert.doesNotMatch(css, /border-radius:[^;{}]*var\(--spacing-/, file);
  }
});

test('dark_landing_text_contrasts_with_its_section_surfaces', async () => {
  const { contrast } = await import('../scripts/lib/contrast.mjs');
  for (const surface of ['ui-card', 'canvas', 'feature-canvas', 'feature-light', 'feature-medium']) {
    const background = resolveValue(tables.dark, `color.${surface}`);
    assert.ok(contrast(resolveValue(tables.dark, 'color.landing-title-color'), background) >= 3);
    for (const role of ['description-color', 'landing-review-meta-ink', 'landing-newsletter-note-ink']) {
      assert.ok(contrast(resolveValue(tables.dark, `color.${role}`), background) >= 4.5, `${role} on ${surface}`);
    }
  }
});

test('dark_canvas_keeps_secondary_sections_distinct_from_cards', () => {
  assert.notEqual(resolveValue(tables.dark, 'color.canvas'), resolveValue(tables.dark, 'color.ui-card'));
});
