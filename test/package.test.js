// Evidence: the package is installed from a Git tag (github:woonyong-choi/design-tokens#v0.1.0), so what `exports` and `files` name must be committed.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { ROOT } from './helpers.mjs';

const pkg = JSON.parse(readFileSync(`${ROOT}package.json`, 'utf8'));

test('every_export_target_exists_in_the_repository_and_is_published', () => {
  for (const target of Object.values(pkg.exports).filter((path) => path !== './package.json')) {
    assert.ok(existsSync(`${ROOT}${target}`), target);
    assert.ok(pkg.files.some((file) => target.startsWith(`./${file}`)), `${target} is not in files`);
  }
});

test('the_package_has_no_install_scripts_so_a_git_install_needs_no_build', () => {
  for (const name of ['preinstall', 'install', 'postinstall', 'prepare']) assert.equal(pkg.scripts[name], undefined, name);
});

test('installed_package_compiles_styles_without_consumer_dependencies', (t) => {
  const consumer = mkdtempSync(join(tmpdir(), 'design-consumer-'));
  t.after(() => rmSync(consumer, { recursive: true, force: true }));
  const run = (command, args, cwd = consumer) => execFileSync(command, args, { cwd, encoding: 'utf8', timeout: 120000, maxBuffer: 16 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
  const [pack] = JSON.parse(run('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', consumer], ROOT));
  writeFileSync(join(consumer, 'package.json'), '{"private":true,"type":"module"}\n');
  run('npm', ['install', '--ignore-scripts', '--omit=dev', '--no-audit', '--no-fund', join(consumer, pack.filename)]);
  run(process.execPath, ['--input-type=module', '-e', `
    import assert from 'node:assert/strict';
    import { compileStyles } from '@woonyong-choi/design-tokens/build/styles';
    const result = await compileStyles('.used { color: red } .unused { color: blue }', new Map([['/', '<p class="used">Text</p>']]), new Map());
    assert.match(result.css, /\\.used/);
    assert.doesNotMatch(result.css, /\\.unused/);
  `]);
});
