import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { exportDesign } from '../ui/build/export.mjs';
import { verifyDesign } from '../ui/build/verify.mjs';

const hash = value => createHash('sha256').update(value).digest('hex');
function artifact(folder, name = 'owned.txt', content = 'design') {
  mkdirSync(folder, { recursive: true });
  writeFileSync(join(folder, 'owned.txt'), content);
  const files = { [name]: hash(content) };
  writeFileSync(join(folder, 'manifest.json'), JSON.stringify({ schemaVersion: 1, files, contentHash: hash(JSON.stringify(files, null, 2) + '\n') }));
}

test('export_refuses_links_and_noncanonical_paths_before_changing_the_target', t => {
  const root = mkdtempSync(join(tmpdir(), 'design-integrity-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const source = join(root, 'source');
  const target = join(root, 'target');
  artifact(source);
  artifact(target, 'owned.txt', 'previous');
  writeFileSync(join(root, 'outside.txt'), 'design');
  rmSync(join(source, 'owned.txt'));
  symlinkSync('../outside.txt', join(source, 'owned.txt'));
  assert.throws(() => exportDesign(source, target), /invalid design artifact/);
  assert.equal(readFileSync(join(target, 'owned.txt'), 'utf8'), 'previous');
  rmSync(join(source, 'owned.txt'));
  artifact(source);
  symlinkSync('../outside.txt', join(source, 'unowned.txt'));
  assert.throws(() => verifyDesign(source), /invalid design artifact/);
  rmSync(join(source, 'unowned.txt'));
  for (const name of ['./owned.txt', 'folder/../owned.txt', 'folder//owned.txt', '/owned.txt', 'folder\\owned.txt', 'C:/owned.txt', 'manifest.json']) {
    artifact(source, name);
    assert.throws(() => exportDesign(source, target), /invalid design path/, name);
    assert.equal(readFileSync(join(target, 'owned.txt'), 'utf8'), 'previous');
  }
  artifact(source);
  exportDesign(source, target);
  assert.equal(readFileSync(join(target, 'owned.txt'), 'utf8'), 'design');
  assert.equal(verifyDesign(target).contentHash, verifyDesign(source).contentHash);
});

test('export_replaces_files_and_directories_at_the_same_path_issue_150', t => {
  const root = mkdtempSync(join(tmpdir(), 'design-path-transition-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const source = join(root, 'source');
  const target = join(root, 'target');
  const write = (folder, entries) => {
    const files = {};
    for (const [name, content] of entries) {
      mkdirSync(dirname(join(folder, name)), { recursive: true });
      writeFileSync(join(folder, name), content);
      files[name] = hash(content);
    }
    writeFileSync(join(folder, 'manifest.json'), JSON.stringify({ schemaVersion: 1, files, contentHash: hash(JSON.stringify(files, null, 2) + '\n') }));
  };
  for (const [previous, next] of [['module', 'module/index.js'], ['module/index.js', 'module']]) {
    rmSync(root, { recursive: true, force: true });
    write(source, [['owned.txt', 'new'], [next, 'next module']]);
    write(target, [['owned.txt', 'old'], [previous, 'previous module']]);

    const expected = verifyDesign(source);
    verifyDesign(target);
    assert.equal(exportDesign(source, target).contentHash, expected.contentHash);
    assert.equal(readFileSync(join(target, next), 'utf8'), 'next module');
    assert.equal(readFileSync(join(target, 'owned.txt'), 'utf8'), 'new');
  }
});
