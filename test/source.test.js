import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import { buildDesign } from '../scripts/lib/design-build.mjs';
import { buildTables, flattenTokens, resolveToken, readSource } from '../scripts/lib/tokens.mjs';
import { themeTable, resolveValue } from '../scripts/lib/token-css.mjs';
import { ROOT, tables } from './helpers.mjs';
import { verifyDesign } from '../scripts/lib/verify-dist.mjs';
import { bundleStyles } from '../scripts/lib/styles-bundle.mjs';

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

test('bundled_style_compiler_contains_locked_patched_inputs_and_complete_licenses', () => {
  const { code, metafile } = bundleStyles(ROOT);
  const lock = JSON.parse(readFileSync(`${ROOT}package-lock.json`, 'utf8'));
  const packages = [...new Set(Object.keys(metafile.inputs)
    .filter(path => path.includes('node_modules/'))
    .map(path => path.match(/^(.*node_modules\/(?:@[^/]+\/)?[^/]+)\//)[1]))];
  assert.ok(packages.includes('node_modules/purgecss'));
  assert.ok(packages.includes('node_modules/postcss-selector-parser'));
  for (const path of packages) {
    const { name, version } = JSON.parse(readFileSync(`${ROOT}${path}/package.json`, 'utf8'));
    assert.equal(version, lock.packages[path].version, path);
    if (name === 'postcss-selector-parser') {
      const [major, minor, patch] = version.split('.').map(Number);
      assert.ok(major > 7 || (major === 7 && minor > 1) || (major === 7 && minor === 1 && patch >= 6), `${path}@${version}`);
    }
    const licenses = readdirSync(`${ROOT}${path}`).filter(name => /^licen[sc]e(?:[.-].*)?$/i.test(name));
    assert.ok(licenses.length > 0, name);
    for (const license of licenses) {
      assert.ok(code.includes(`/*! ${name}@${version} (${license})\n`), name);
      assert.ok(code.includes(readFileSync(`${ROOT}${path}/${license}`, 'utf8')), `${name}/${license}`);
    }
  }
  assert.equal(readFileSync(`${ROOT}dist/ui/build/styles.mjs`, 'utf8'), code);
  const manifest = JSON.parse(readFileSync(`${ROOT}dist/manifest.json`, 'utf8'));
  assert.equal(manifest.files['ui/build/styles.mjs'], createHash('sha256').update(code).digest('hex'));
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

test('light_header_footer_and_newsletter_text_meet_body_contrast', async () => {
  const { contrast } = await import('../scripts/lib/contrast.mjs');
  const background = resolveValue(tables.light, 'color.ui-card');
  for (const role of ['nav-color', 'landing-footer-ink', 'landing-newsletter-note-ink']) {
    assert.ok(contrast(resolveValue(tables.light, `color.${role}`), background) >= 4.5, role);
  }
});

test('dark_canvas_keeps_secondary_sections_distinct_from_cards', () => {
  assert.notEqual(resolveValue(tables.dark, 'color.canvas'), resolveValue(tables.dark, 'color.ui-card'));
});

test('service_brand_icon_size_has_one_shared_role_in_both_modes', () => {
  const source = JSON.parse(readFileSync(ROOT + 'tokens/tokens.json', 'utf8'));
  assert.equal(source.spacing.figure.icon.brand.$value, '{spacing.figure.icon.node}');
  for (const table of Object.values(tables)) {
    assert.equal(resolveValue(table, 'spacing.figure.icon.brand'), resolveValue(table, 'spacing.figure.icon.node'));
    assert.equal(resolveValue(table, 'spacing.figure.icon.node'), '20px');
    assert.equal(resolveValue(table, 'spacing.figure.icon.tile'), '32px');
  }
});

test('diagram_label_faces_keep_readable_ink_in_both_themes_and_states', async () => {
  const { contrast } = await import('../scripts/lib/contrast.mjs');
  for (const table of [tables.light, tables.dark]) for (const state of ['', 'active-']) {
    const fill = resolveValue(table, `color.figure.label-${state}fill`);
    const ink = resolveValue(table, `color.figure.label-${state}ink`);
    assert.ok(contrast(ink, fill) >= 4.5, `${state || 'rest'} label contrast`);
  }
});
