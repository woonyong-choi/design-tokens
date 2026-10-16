import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { readSource } from '../scripts/lib/tokens.mjs';
import { tables } from './helpers.mjs';
import { resolveValue, themeTable } from '../scripts/lib/token-css.mjs';
import { contrast } from '../scripts/lib/contrast.mjs';
import { RUNTIME_PROPERTIES } from '../ui/build/lib/tokens-patterns.mjs';
import { SYNTAX_ROLES } from '../dist/ui/components.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const modules = readdirSync(root + 'styles', { recursive: true }).filter(name => name.endsWith('.css')).map(name => `styles/${name}`);
const illustrations = readdirSync(root + 'assets/illustrations').map(name => `assets/illustrations/${name}`);
const audited = [...modules, ...illustrations, `assets/giscus.css`, ...readdirSync(root + 'ui', { recursive: true }).filter(name => /\.(?:mjs|js)$/.test(name) && !name.startsWith('build/')).map(name => `ui/${name}`)];
// 스크립트가 데이터에서 계산해 넣는 값. 토큰이 아니다.
const RUNTIME = new Set(RUNTIME_PROPERTIES);
const audit = files => spawnSync(process.execPath, ['ui/build/check-tokens.mjs', ...files, '--tokens', 'tokens/tokens.json'], { cwd: root, encoding: 'utf8' });

test('audited_component_sources_have_no_hardcoded_presentation_values', () => {
  const result = audit(audited);
  assert.equal(result.status, 0, result.stdout + result.stderr);
});

test('every_css_variable_used_by_component_sources_is_a_theme_token', () => {
  const defined = new Set([...themeTable(readSource(root).light).keys()].map(name => `--${name.replaceAll('.', '-')}`));
  for (const file of audited) for (const [, name] of readFileSync(root + file, 'utf8').matchAll(/(--[\w-]+)\s*:/g)) defined.add(name);
  for (const file of audited) {
    const missing = [...new Set([...readFileSync(root + file, 'utf8').matchAll(/var\((--[\w-]+)/g)].map(match => match[1]))].filter(name => !defined.has(name) && !RUNTIME.has(name));
    assert.deepEqual(missing, [], file);
  }
});

test('body_and_caption_text_are_readable_on_the_page_in_each_theme', () => {
  for (const [mode, table] of Object.entries(tables)) {
    assert.ok(contrast(resolveValue(table, 'color.body'), resolveValue(table, 'color.ui-card')) >= 4.5, `${mode} body text on page`);
    assert.ok(contrast(resolveValue(table, 'color.prose-caption-color'), resolveValue(table, 'color.ui-card')) >= 4.5, `${mode} caption text on page`);
  }
});

test('category_and_flow_share_readable_solid_color_pairs', () => {
  for (const [mode, table] of Object.entries(tables)) {
    for (const [index, family] of ['blue', 'orange', 'cyan', 'yellow', 'green', 'purple', 'red'].entries()) {
      const fill = resolveValue(table, `color.category.${family}.solid`);
      const ink = resolveValue(table, `color.category.${family}.on-solid`);
      assert.equal(resolveValue(table, `color.data.category.${index + 1}`), fill);
      assert.equal(resolveValue(table, `color.data.category-on.${index + 1}`), ink);
      assert.ok(contrast(ink, fill) >= 4.5, `${mode} ${family}`);
    }
    assert.equal(resolveValue(table, 'color.data.reference'), resolveValue(table, 'color.data.grid'));
  }
});

test('diagram_lines_put_edges_above_dashed_boundaries_above_card_hairlines', () => {
  for (const [mode, table] of Object.entries(tables)) {
    const value = key => resolveValue(table, key);
    assert.notEqual(value('color.prose-pre-background'), value('color.ui-card'), mode + ' diagram surface differs from page');
    for (const background of ['color.ui-card', 'color.figure.canvas']) {
      const on = key => contrast(value(key), value(background));
      assert.ok(on('color.line') >= 3, mode + ' edge on ' + background);
      assert.ok(on('color.line') > on('color.figure.boundary'), mode + ' edge above dashed boundary on ' + background);
      assert.ok(on('color.figure.boundary') > on('color.figure.outline'), mode + ' dashed boundary above hairline on ' + background);
    }
    assert.equal(value('color.figure.cell-line'), value('color.figure.outline'), mode + ' cells share the card hairline');
    assert.notEqual(value('color.figure.inner-surface'), value('color.ui-card'), mode + ' inner surface differs from card');
    assert.equal(value('color.figure.queue-empty'), value('color.figure.inner-surface'), mode + ' empty slot is an inner surface');
  }
  const lum = hex => contrast(hex, '#000000');
  assert.ok(lum(resolveValue(tables.dark, 'color.figure.inner-surface')) > lum(resolveValue(tables.dark, 'color.ui-card')), 'dark inner surface is raised, not a hole');
});

test('chart_categories_are_calm_and_need_labels_only_below_three_to_one', () => {
  for (const [mode, table] of Object.entries(tables)) {
    const canvas = resolveValue(table, 'color.figure.canvas');
    for (let n = 1; n <= 7; n += 1) {
      const fill = resolveValue(table, `color.data.category.${n}`);
      const ink = resolveValue(table, `color.data.category-ink.${n}`);
      assert.ok(contrast(ink, canvas) >= 4.5, `${mode} series ${n} text on canvas`);
      if (contrast(fill, canvas) < 3) assert.equal(resolveValue(table, `color.data.category-label.${n}`), 'required', `${mode} series ${n} needs a direct label`);
    }
    assert.ok(contrast(resolveValue(table, 'color.data.other-on'), resolveValue(table, 'color.data.other')) >= 4.5, `${mode} text on the other series`);
    assert.equal(resolveValue(table, 'color.data.compare'), resolveValue(table, 'color.data.other-outline'), `${mode} comparison series is muted`);
  }
});

test('icons_keep_contrast_on_page_paper_and_tool_surfaces_in_both_themes', () => {
  for (const [mode, table] of Object.entries(tables)) {
    const hex = name => resolveValue(table, name);
    assert.ok(contrast(hex('icon.neutral'), hex('color.ui-card')) >= 3, `${mode} icon on page`);
    assert.ok(contrast(hex('icon.brand.postgresql'), hex('color.ui-card')) >= 3, `${mode} PostgreSQL silhouette on page`);
    assert.ok(contrast(hex('icon.brand.nginx'), hex('color.ui-card')) >= 3, `${mode} NGINX silhouette on page`);
    assert.ok(contrast(hex('icon.neutral-edge'), hex('icon.paper')) >= 4.5, `${mode} annotation on paper`);
    const surface = hex('color.prose-pre-background');
    for (const background of ['color.prose-pre-background', 'color.control-hover', 'color.control-active']) {
      const fill = onSurface(hex(background), surface);
      for (const role of ['color.ui-muted', 'color.accent', 'color.state.success', 'color.state.error']) {
        assert.ok(contrast(hex(role), fill) >= 3, `${mode}.${role} on ${background}`);
      }
    }
    assert.ok(contrast(hex('color.ui.focus'), surface) >= 3, `${mode} tool focus ring`);
  }
});

test('static_icon_structure_edge_keeps_contrast_after_light_token_binding', () => {
  const edge = resolveValue(tables.light, 'icon.structure-edge');
  for (const [mode, table] of Object.entries(tables)) {
    for (const background of ['color.ui-card', 'color.prose-pre-background']) {
      assert.ok(contrast(edge, resolveValue(table, background)) >= 3, `${mode} static edge on ${background}`);
    }
  }
});

test('media_symbol_and_edge_keep_contrast_at_playing_opacity', () => {
  const colors = ['icon.paper', 'icon.control-edge'].map(name => resolveValue(tables.light, name));
  const opacity = Number(resolveValue(tables.light, 'opacity.landing-logo-opacity'));
  const fade = (color, alpha, surface) => {
    const channels = color.slice(1).match(/../g).map(value => Number.parseInt(value, 16));
    return onSurface(`rgba(${channels.join(',')},${alpha})`, surface);
  };
  for (const [mode, table] of Object.entries(tables)) {
    const card = resolveValue(table, 'color.ui-card');
    for (const background of ['color.ui-card', 'color.control-hover', 'color.control-active']) {
      const surface = onSurface(resolveValue(table, background), card);
      for (const alpha of [1, opacity]) {
        const [symbol, edge] = colors.map(color => fade(color, alpha, surface));
        assert.ok(contrast(symbol, edge) >= 3, `${mode} media at ${alpha} on ${background}`);
      }
    }
  }
});

function onSurface(color, surface) {
  if (color.startsWith('#')) return color;
  const [r, g, b, alpha] = color.match(/[\d.]+/g).map(Number);
  const base = Number.parseInt(surface.slice(1), 16);
  return '#' + [r, g, b].map((channel, index) => Math.round(channel * alpha + ((base >> (16 - 8 * index)) & 255) * (1 - alpha)).toString(16).padStart(2, '0')).join('');
}

test('syntax_and_comment_colors_keep_text_contrast_on_the_code_surface', () => {
  for (const [mode, table] of Object.entries(tables)) {
    const hex = name => resolveValue(table, name);
    const inline = onSurface(hex('color.prose-code-background'), hex('color.ui-card'));
    const code = hex('color.prose-pre-background');
    assert.ok(contrast(onSurface(hex('color.prose-code-color'), inline), inline) >= 4.5, `${mode} inline code`);
    for (const role of ['color.prose-code-color', ...SYNTAX_ROLES.map(role => `color.syntax-${role}`)]) {
      assert.ok(contrast(onSurface(hex(role), code), code) >= 4.5, `${mode}.${role} on code surface ${code}`);
    }
    for (const role of ['keyword', 'string', 'number']) assert.notEqual(hex(`color.syntax-${role}`), hex('color.prose-code-color'), role);
  }
});


// #180: 작은 탭 글자와 태그 기호는 실제 합성 면에서도 식별할 수 있어야 한다.
test('tab_and_tag_states_keep_text_and_selection_contrast_in_both_themes', () => {
  for (const [mode, table] of Object.entries(tables)) {
    const value = name => resolveValue(table, name);
    assert.ok(contrast(value('color.ui-muted'), value('color.tag-background')) >= 4.5, mode + ' default tag text');
    assert.ok(contrast(value('color.on-action'), value('color.tag-hover')) >= 4.5, mode + ' tag text and clear symbol');
    const selected = value('color.feature-tab-selected');
    const ink = value('color.feature-tab-ink');
    assert.ok(contrast(ink, selected) >= 4.5, mode + ' selected tab text');
    for (const base of ['color.ui-card', 'color.prose-pre-background']) {
      const gallery = onSurface(value('color.gallery-selected'), value(base));
      assert.ok(contrast(value('color.gallery-selected-ink'), gallery) >= 4.5, mode + ' selected number text');
      assert.ok(contrast(gallery, onSurface(value('color.gallery-background'), value(base))) >= 3, mode + ' selected number state');
      const channels = gallery.slice(1).match(/../g).map(channel => Number.parseInt(channel, 16));
      assert.ok(Math.max(...channels) - Math.min(...channels) <= 12, mode + ' selected numbers remain neutral');
      const track = onSurface(value('color.feature-tab-background'), value(base));
      assert.ok(contrast(selected, track) >= 3, mode + ' selected tab against ' + base);
      for (const state of ['color.feature-tab-background', 'color.platform-hover', 'color.platform-active']) {
        const surface = onSurface(value(state), track);
        assert.ok(contrast(onSurface(value('color.platform-color'), surface), surface) >= 4.5, mode + ' unselected tab ' + state);
      }
    }
  }
});

test('component_contract_classes_exist_in_style_sources', () => {
  const doc = readFileSync(root + 'docs/styles.md', 'utf8');
  const contract = doc.slice(doc.indexOf('## 구성 요소 계약'), doc.indexOf('### 강제하는 것'));
  const css = modules.map(file => readFileSync(root + file, 'utf8')).join('\n');
  const classes = [...new Set([...contract.matchAll(/\.(app-[\w-]+)/g)].map(match => match[1]))];
  assert.ok(classes.length >= 20);
  assert.deepEqual(classes.filter(name => !new RegExp(`\\.${name}(?![\\w-])`).test(css)), []);
});


test('playing_media_symbols_keep_contrast_on_default_hover_and_pressed_surfaces', () => {
  const css = readFileSync(root + 'styles/controls.css', 'utf8');
  const rule = /\.app-remote\.is-playing \[data-control-icon\] \{([^}]+)\}/.exec(css)?.[1];
  assert.ok(rule, 'custom-class control slots receive the same playing-state treatment');
  assert.match(rule, /color: var\(--color-control-playing-ink\)/);
  assert.doesNotMatch(rule, /opacity:/, 'the essential symbol is not faded with decorative logos');
  for (const [mode, table] of Object.entries(tables)) {
    const hex = name => resolveValue(table, name);
    const ink = hex('color.control-playing-ink');
    assert.ok(contrast(hex('icon.paper'), ink) >= 3, `${mode} pause bars on their circle`);
    const page = hex('color.ui-card');
    for (const [state, surface] of [['default', page], ['hover/pressed', onSurface(hex('color.control-active'), page)]]) {
      assert.ok(contrast(ink, surface) >= 3, `${mode} playing control on ${state} background`);
    }
  }
});

test('dark_help_card_text_is_readable_in_default_hover_and_active_states', () => {
  const table = tables.dark;
  for (const background of ['help-bg', 'help-hover', 'help-active', 'help-grouped-bg', 'related-background']) {
    for (const foreground of ['help-title-color', 'help-copy-color', 'body', 'document-nav-active-ink']) {
      assert.ok(contrast(resolveValue(table, `color.${foreground}`), resolveValue(table, `color.${background}`)) >= 4.5, `${foreground} on ${background}`);
    }
  }
});

// #184: 앱 도구와 중립 선택 면의 공개 소비 계약.
test('workspace_roles_keep_neutral_surfaces_readable_in_both_themes', () => {
  for (const [mode, table] of Object.entries(tables)) {
    for (const role of ['sidebar', 'document', 'toolbar', 'hover', 'selected']) {
      const surface = resolveValue(table, `color.workspace.${role}`);
      const channels = surface.slice(1).match(/../g).map(channel => Number.parseInt(channel, 16));
      assert.equal(new Set(channels).size, 1, `${mode} ${role} neutral surface`);
      assert.ok(contrast(resolveValue(table, 'color.ink'), surface) >= 4.5, `${mode} text on ${role}`);
    }
    assert.notEqual(resolveValue(table, 'color.workspace.document'), resolveValue(table, 'color.workspace.sidebar'));
    for (const [role, expected] of [['text.tool', '13px'], ['spacing.tool-icon', '16px'], ['spacing.tool-target', '28px'], ['spacing.toolbar', '40px']]) {
      assert.equal(resolveValue(table, role), expected, role);
    }
    assert.match(resolveValue(table, 'font.ui'), /system-ui/);
    assert.doesNotMatch(resolveValue(table, 'font.ui'), /Pretendard/);
  }
});

// 다크 미리보기에서 주의 상자·글머리 점·선택 탭 글자·입력 칸이 사라지지 않아야 한다.
test('warning_callout_list_marker_and_input_stay_readable_in_both_themes', () => {
  for (const [mode, table] of Object.entries(tables)) {
    const value = name => resolveValue(table, name);
    for (const base of ['color.ui-card', 'color.prose-pre-background']) {
      const page = value(base);
      const warning = onSurface(value('color.callout-warning'), page);
      assert.ok(contrast(value('color.body'), warning) >= 4.5, `${mode} warning callout text on ${base}`);
      assert.ok(contrast(onSurface(value('color.prose-marker'), page), page) >= 3, `${mode} list marker on ${base}`);
      const note = onSurface(value('color.callout-background'), page);
      assert.ok(contrast(value('color.body'), note) >= 4.5, `${mode} callout text on ${base}`);
      // Things처럼 다크 안내 상자는 페이지보다 밝은 면으로 구분한다. 라이트는 원래 옅은 면을 유지한다.
      if (mode === 'dark') assert.ok(contrast(note, page) >= 1.2, `${mode} callout surface stands apart from ${base}`);
      const mark = onSurface(value('color.prose-mark-background'), page);
      assert.ok(contrast(value('color.body'), mark) >= 4.5, `${mode} marked text on ${base}`);
      const toc = onSurface(value('color.toc-background'), page);
      assert.ok(contrast(onSurface(value('color.toc-marker'), toc), toc) >= 3, `${mode} toc marker on ${base}`);
      const input = onSurface(value('color.input-background'), page);
      assert.ok(contrast(value('color.input-ink'), input) >= 4.5, `${mode} input text on ${base}`);
      assert.ok(contrast(value('color.input-placeholder'), input) >= 4.5, `${mode} input placeholder on ${base}`);
    }
    // 다크는 밝은 선택 면 위의 어두운 글자이므로 본문 수준 이상의 대비를 둔다.
    assert.ok(contrast(value('color.feature-tab-ink'), value('color.feature-tab-selected')) >= (mode === 'dark' ? 7 : 4.5), `${mode} selected tab text stays clearly legible`);
  }
  assert.equal(resolveValue(tables.light, 'color.callout-warning'), resolveValue(tables.light, 'primitive.callout-warning'), 'light warning surface unchanged');
  assert.equal(resolveValue(tables.dark, 'color.prose-mark-background'), resolveValue(tables.dark, 'color.callout-warning'), 'mark shares the warning surface');
  assert.equal(resolveValue(tables.dark, 'color.toc-marker'), resolveValue(tables.dark, 'color.prose-marker'), 'toc marker shares the list marker');
});
