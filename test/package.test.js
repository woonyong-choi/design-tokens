// Evidence: consumers install the package from a pinned Git commit (github:woonyong-choi/design-tokens#<commit>), so what `exports`, `bin` and `files` name must be committed.
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { ROOT } from './helpers.mjs';
import { compileStyles } from '../ui/build/styles.mjs';

const pkg = JSON.parse(readFileSync(`${ROOT}package.json`, 'utf8'));

test('every_export_target_exists_in_the_repository_and_is_published', () => {
  for (const target of Object.values(pkg.exports).filter((path) => path !== './package.json')) {
    assert.ok(existsSync(`${ROOT}${target.replace(/\*$/, '')}`), target);
    assert.ok(pkg.files.some((file) => target.startsWith(`./${file}`)), `${target} is not in files`);
  }
});

test('the_token_checker_is_a_published_command', () => {
  for (const target of Object.values(pkg.bin)) {
    assert.ok(pkg.files.some((file) => target.startsWith(file)), `${target} is not in files`);
    assert.match(readFileSync(`${ROOT}${target}`, 'utf8'), /^#!\/usr\/bin\/env node\n/);
  }
});

test('the_package_has_no_install_scripts_so_a_git_install_needs_no_build', () => {
  for (const name of ['preinstall', 'install', 'postinstall', 'prepare']) assert.equal(pkg.scripts[name], undefined, name);
});

test('installed_package_compiles_styles_without_consumer_dependencies', async (t) => {
  const consumer = mkdtempSync(join(tmpdir(), 'design-consumer-'));
  t.after(() => rmSync(consumer, { recursive: true, force: true }));
  const run = (command, args, cwd = consumer) => execFileSync(command, args, { cwd, encoding: 'utf8', timeout: 120000, maxBuffer: 16 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
  const [pack] = JSON.parse(run('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', consumer], ROOT));
  writeFileSync(join(consumer, 'package.json'), '{"private":true,"type":"module"}\n');
  run('npm', ['install', '--ignore-scripts', '--omit=dev', '--no-audit', '--no-fund', join(consumer, pack.filename)]);
  const css = readFileSync(`${ROOT}dist/styles.css`, 'utf8');
  const theme = readFileSync(`${ROOT}dist/tokens.css`, 'utf8');
  const pages = [['/', '<div class="app-tabs"><div class="app-tablist"><button aria-selected="false">Tab</button></div><div class="app-tabpanel">Panel</div></div><button class="app-tool-button" data-state="idle">Copy</button><button class="app-remote">Play</button>']];
  const scripts = ['toolbar', 'document', 'flows'].map(name => [`${name}.js`, readFileSync(`${ROOT}ui/runtime/${name}.js`, 'utf8')]);
  const expected = await compileStyles(css, new Map(pages), new Map(scripts), theme);
  assert.ok(expected.removed > 0);
  for (const selector of ['data-state=done', 'aria-selected=true', '.is-playing', ':focus-visible']) assert.ok(expected.css.includes(selector), selector);
  assert.ok(expected.theme.includes('--color-state-success:'));
  assert.ok(expected.theme.includes('--duration-notice:'));
  writeFileSync(join(consumer, 'styles-fixture.json'), JSON.stringify({ css, theme, pages, scripts, expected }));
  run(process.execPath, ['--input-type=module', '-e', `
    import assert from 'node:assert/strict';
    import { compileStyles } from '@woonyong-choi/design-tokens/build/styles';
    const result = await compileStyles('.used { color: red } .unused { color: blue }', new Map([['/', '<p class="used">Text</p>']]), new Map());
    assert.match(result.css, /\\.used/);
    assert.doesNotMatch(result.css, /\\.unused/);
    const { escape } = await import('@woonyong-choi/design-tokens/ui/index.mjs');
    assert.equal(String(escape('<a>')), '&lt;a&gt;');
    const { createRequire } = await import('node:module');
    const require = createRequire(process.cwd() + '/');
    const packageRequire = createRequire(require.resolve('@woonyong-choi/design-tokens/package.json'));
    for (const name of ['purgecss', 'postcss-selector-parser']) assert.throws(() => packageRequire.resolve(name), { code: 'MODULE_NOT_FOUND' });
    const { readFileSync } = await import('node:fs');
    const fixture = JSON.parse(readFileSync('styles-fixture.json', 'utf8'));
    assert.deepEqual(await compileStyles(fixture.css, new Map(fixture.pages), new Map(fixture.scripts), fixture.theme), fixture.expected);
    const { pruneTokens } = await import('@woonyong-choi/design-tokens/build/styles');
    const { pruneTokens: originalPruneTokens } = await import('@woonyong-choi/design-tokens/ui/build/prune-tokens.mjs');
    assert.equal(pruneTokens, originalPruneTokens);
    assert.match(require.resolve('@woonyong-choi/design-tokens/styles/tabs.css'), /dist[\\/]styles[\\/]tabs\.css$/);
  `]);
  const installed = JSON.parse(run('npm', ['ls', '--all', '--json']));
  assert.ok(installed.dependencies[pkg.name]);
  const audit = JSON.parse(run('npm', ['audit', '--json']));
  assert.equal(audit.metadata.vulnerabilities.total, 0);
  writeFileSync(join(consumer, 'page.css'), '.page { color: #ff0000; }\n');
  const checked = spawnSync(join(consumer, 'node_modules/.bin/design-tokens-check'), ['page.css', '--tokens', 'node_modules/@woonyong-choi/design-tokens/dist/tokens.json'], { cwd: consumer, encoding: 'utf8' });
  assert.equal(checked.status, 1, checked.stderr);
  assert.match(checked.stdout, /page\.css:1: .*#ff0000/);
});
