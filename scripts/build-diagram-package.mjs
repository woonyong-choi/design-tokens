import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildDesign } from './lib/design-build.mjs';
import { buildDiagramPackage } from './lib/diagram-package.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = join(ROOT, 'artifacts/diagram.tgz');
const STAGING = join(ROOT, '.local/diagram-package', String(process.pid));

function pack(folder) {
  const [result] = JSON.parse(execFileSync('npm', ['pack', '--json', '--ignore-scripts'], { cwd: folder, encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 }));
  const bytes = readFileSync(join(folder, result.filename));
  const integrity = `sha512-${createHash('sha512').update(bytes).digest('base64')}`;
  if (result.integrity !== integrity) throw new Error('diagram npm integrity mismatch');
  rmSync(join(folder, result.filename));
  return { bytes, integrity };
}

try {
  if (process.argv.slice(2).some(arg => arg !== '--check')) throw new Error('usage: node scripts/build-diagram-package.mjs [--check]');
  const files = buildDiagramPackage({ packageJson: readFileSync(join(ROOT, 'package.json')), license: readFileSync(join(ROOT, 'LICENSE')), fullFiles: buildDesign(ROOT) });
  for (const [name, value] of files) {
    const path = join(STAGING, name);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, value);
  }
  const first = pack(STAGING);
  const second = pack(STAGING);
  if (!first.bytes.equals(second.bytes)) throw new Error('diagram npm pack is not reproducible');
  if (process.argv.includes('--check')) {
    if (!readFileSync(OUTPUT).equals(first.bytes)) throw new Error('stale generated file: artifacts/diagram.tgz');
  } else {
    mkdirSync(dirname(OUTPUT), { recursive: true });
    writeFileSync(OUTPUT, first.bytes);
  }
  console.log(`artifacts/diagram.tgz ${first.bytes.length} bytes ${first.integrity} ${process.argv.includes('--check') ? 'checked' : 'built'}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  rmSync(STAGING, { recursive: true, force: true });
}
