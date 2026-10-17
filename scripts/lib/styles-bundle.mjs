import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { buildSync } from 'esbuild';

export function bundleStyles(root) {
  const result = buildSync({
    absWorkingDir: root,
    entryPoints: ['ui/build/styles.mjs'],
    bundle: true,
    write: false,
    platform: 'node',
    format: 'esm',
    target: 'node20',
    external: ['esbuild', 'postcss', './prune-tokens.mjs'],
    metafile: true,
    legalComments: 'inline',
    banner: { js: 'import { createRequire } from "node:module"; const require = createRequire(import.meta.url);' },
  });
  const packages = [...new Set(Object.keys(result.metafile.inputs)
    .map(path => path.match(/^(.*node_modules\/(?:@[^/]+\/)?[^/]+)\//)?.[1])
    .filter(Boolean))].sort();
  const notices = packages.map(path => licenseNotice(root, path)).join('\n');
  return { code: notices + result.outputFiles[0].text, metafile: result.metafile };
}

function licenseNotice(root, path) {
  const folder = join(root, path);
  const { name, version } = JSON.parse(readFileSync(join(folder, 'package.json'), 'utf8'));
  const licenses = readdirSync(folder).filter(name => /^licen[sc]e(?:[.-].*)?$/i.test(name)).sort();
  if (licenses.length === 0) throw new Error(`missing bundled license: ${name}@${version}`);
  return licenses.map(file => {
    const license = readFileSync(join(folder, file), 'utf8');
    if (license.includes('*/')) throw new Error(`bundled license cannot be embedded: ${name}@${version}/${file}`);
    return `/*! ${name}@${version} (${file})\n${license}\n*/\n`;
  }).join('');
}
