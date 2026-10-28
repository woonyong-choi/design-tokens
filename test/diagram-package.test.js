import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { buildDesign } from '../scripts/lib/design-build.mjs';
import { buildDiagramPackage } from '../scripts/lib/diagram-package.mjs';
import { verifyDesign } from '../scripts/lib/verify-dist.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const INPUT = Object.freeze({ packageJson: readFileSync(join(ROOT, 'package.json')), license: readFileSync(join(ROOT, 'LICENSE')), fullFiles: buildDesign(ROOT) });
const ICONS = Object.freeze('aws-api-gateway aws-cloudfront aws-cloudwatch aws-dynamodb aws-ec2 aws-ecs aws-eks aws-elasticache aws-elb aws-iam aws-lambda aws-rds aws-route53 aws-s3 aws-sns aws-sqs aws-vpc check close docker download-bottom ellipsis file-copy git github google google-cloud google-drive kubernetes maximize mdi-account mdi-account-alert mdi-card-account-details mdi-cookie mdi-database mdi-domain mdi-email mdi-file-check mdi-file-key mdi-harddisk mdi-image-multiple mdi-key mdi-lock mdi-refresh mdi-server mdi-shield-check mdi-web minimize nginx postgresql redis scan user user-settings warning zoom-in zoom-out'.split(' ').sort());
const CONTROLS = Object.freeze('alert check copy download maximize-2 minimize-2 scan zoom-in zoom-out'.split(' ').sort());

function run(command, args, cwd) {
  return execFileSync(command, args, { cwd, encoding: 'utf8', timeout: 120000, maxBuffer: 16 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
}

function fixture(name, action) {
  const folder = join(ROOT, '.local/diagram-package-test', `${process.pid}-${name}`);
  mkdirSync(folder, { recursive: true });
  try { return action(folder); } finally { rmSync(folder, { recursive: true, force: true }); }
}

test('buildDiagramPackage_selects_the_diagram_contract_without_mutating_full_design', () => {
  const before = JSON.stringify(INPUT.fullFiles);
  const files = buildDiagramPackage(INPUT);
  assert.equal(JSON.stringify(INPUT.fullFiles), before);
  const pkg = JSON.parse(files.get('package.json'));
  assert.deepEqual(pkg.designTokensProfile.icons, ICONS);
  assert.deepEqual(pkg.designTokensProfile.controls, CONTROLS);
  assert.equal(pkg.designTokensProfile.sourceContentHash, JSON.parse(INPUT.fullFiles['manifest.json']).contentHash);
  for (const field of ['name', 'version', 'engines', 'bin', 'files']) assert.deepEqual(pkg[field], JSON.parse(INPUT.packageJson)[field]);
  assert.deepEqual(pkg.dependencies, { postcss: JSON.parse(INPUT.packageJson).dependencies.postcss });
  assert.equal(pkg.exports['./build/styles'], undefined);
  assert.equal(files.has('dist/ui/build/styles.mjs'), false);
  for (const field of ['scripts', 'devDependencies', 'overrides']) assert.equal(pkg[field], undefined);
  assert.equal(pkg.exports['./tailwind.css'], undefined);
  const catalog = JSON.parse(files.get('dist/assets/icons/catalog.json'));
  assert.deepEqual(Object.keys(catalog.icons).sort(), ICONS);
  for (const group of ['social', 'articles', 'kinds']) assert.deepEqual(catalog[group], {});
  assert.deepEqual(Object.keys(catalog.controls).sort(), CONTROLS);
  const fullCatalog = JSON.parse(INPUT.fullFiles['assets/icons/catalog.json']);
  assert.deepEqual(catalog.categories, fullCatalog.categories);
  assert.deepEqual(catalog.libraries, fullCatalog.libraries);
  assert.deepEqual(catalog.aliases, Object.fromEntries(Object.entries(fullCatalog.aliases).filter(([, target]) => ICONS.includes(target))));
  for (const item of [...fullCatalog.libraries, ...Object.values(fullCatalog.brands)]) if (item.notice) assert.ok(files.has(`dist/assets/icons/${item.notice}`));
  for (const [name, content] of Object.entries(INPUT.fullFiles)) if ((name.startsWith('ui/') && !['ui/icon-data.mjs', 'ui/build/styles.mjs'].includes(name)) || name.startsWith('styles/diagram/')) assert.deepEqual(files.get(`dist/${name}`), Buffer.from(content), name);
  const svgFiles = [...files.keys()].filter(name => name.endsWith('.svg'));
  assert.equal(svgFiles.length, 57);
  assert.deepEqual(svgFiles.sort(), Object.values(catalog.icons).map(icon => `dist/assets/icons/${icon.file}`).sort());
  for (const name of svgFiles) assert.deepEqual(files.get(name), Buffer.from(INPUT.fullFiles[name.slice(5)]), name);
  assert.ok(![...files.keys()].some(name => /fonts|illustrations|styles\.css|styles\.source|tailwind/.test(name)));
  fixture('manifest', folder => {
    for (const [name, content] of files) { mkdirSync(dirname(join(folder, name)), { recursive: true }); writeFileSync(join(folder, name), content); }
    const manifest = verifyDesign(join(folder, 'dist'));
    assert.notEqual(manifest.contentHash, pkg.designTokensProfile.sourceContentHash);
  });
});

test('admin_preserves_user_silhouette_and_existing_central_gear', () => {
  const user = readFileSync(join(ROOT, 'assets/icons/people/user.svg'), 'utf8');
  const admin = readFileSync(join(ROOT, 'assets/icons/people/user-settings.svg'), 'utf8');
  const gearHashes = ['ec8fd9961c58187f7630598062b5f563d9c79bed675cb9dc6386ffc609420991', '4693129c011de8ef19580c2058ca1703e7a6bee442285c96e7d1f996c6e32efe'];
  for (const [index, mode] of ['color', 'monochrome'].entries()) {
    const userGroup = user.split('\n').find(line => line.includes(`data-name="${mode}"`));
    const adminGroup = admin.split('\n').find(line => line.includes(`data-name="${mode}"`));
    const userShapes = userGroup.match(/<(?:circle|path)\b[^>]*\/>/g);
    const adminShapes = adminGroup.match(/<(?:circle|path)\b[^>]*\/>/g);
    assert.deepEqual(adminShapes.slice(0, -2), userShapes, `${mode} person silhouette`);
    assert.equal(createHash('sha256').update(adminShapes.slice(-2).join('')).digest('hex'), gearHashes[index], `${mode} central gear`);
  }
});

test('buildDiagramPackage_rejects_unknown_icons_missing_files_and_controls', () => {
  const catalog = JSON.parse(INPUT.fullFiles['assets/icons/catalog.json']);
  delete catalog.icons.check;
  assert.throws(() => buildDiagramPackage({ ...INPUT, fullFiles: { ...INPUT.fullFiles, 'assets/icons/catalog.json': JSON.stringify(catalog) } }), /unknown diagram icon: check/);
  const missing = { ...INPUT.fullFiles };
  delete missing['tokens.css'];
  assert.throws(() => buildDiagramPackage({ ...INPUT, fullFiles: missing }), /missing diagram input: tokens.css/);
  const noControl = JSON.parse(INPUT.fullFiles['assets/icons/catalog.json']);
  delete noControl.controls.copy;
  assert.throws(() => buildDiagramPackage({ ...INPUT, fullFiles: { ...INPUT.fullFiles, 'assets/icons/catalog.json': JSON.stringify(noControl) } }), /missing diagram control: copy/);
  const undeclared = { ...INPUT.fullFiles, 'ui/extra.mjs': "import { x } from 'left-pad';\n" };
  assert.throws(() => buildDiagramPackage({ ...INPUT, fullFiles: undeclared }), /undeclared diagram dependency: left-pad/);
});

test('diagram_tarball_is_reproducible_safe_and_excluded_from_full_package', () => {
  const before = readFileSync(join(ROOT, 'artifacts/diagram.tgz'));
  run(process.execPath, ['scripts/build-diagram-package.mjs', '--check'], ROOT);
  assert.deepEqual(readFileSync(join(ROOT, 'artifacts/diagram.tgz')), before);
  const entries = run('tar', ['-tzf', 'artifacts/diagram.tgz'], ROOT).trim().split('\n');
  for (const entry of entries) {
    assert.ok(entry.startsWith('package/'), entry);
    assert.ok(!entry.split('/').includes('..'), entry);
  }
  const details = run('tar', ['-tvzf', 'artifacts/diagram.tgz'], ROOT).trim().split('\n');
  assert.ok(details.every(line => !line.startsWith('l')), 'no tar symlinks');
  fixture('full-pack', folder => {
    const [packed] = JSON.parse(run('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', folder], ROOT));
    assert.ok(!packed.files.some(file => file.path.startsWith('artifacts/')));
    const integrity = `sha512-${createHash('sha512').update(readFileSync(join(folder, packed.filename))).digest('base64')}`;
    assert.equal(packed.integrity, integrity);
  });
});

test('installed_diagram_tarball_runs_public_ui_runtime_styles_icons_and_bin', () => fixture('consumer', folder => {
  writeFileSync(join(folder, 'package.json'), '{"private":true,"type":"module"}\n');
  run('npm', ['install', '--ignore-scripts', '--omit=dev', '--no-audit', '--no-fund', join(ROOT, 'artifacts/diagram.tgz')], folder);
  run(process.execPath, ['--input-type=module', '-e', `
    import assert from 'node:assert/strict';
    import { readFileSync } from 'node:fs';
    import { createRequire } from 'node:module';
    import { getIconCatalog, readIcon } from '@woonyong-choi/design-tokens/icons';
    import { ControlIcon } from '@woonyong-choi/design-tokens/ui/icons.mjs';
    import { ICON_DATA, ICON_ROLES } from '@woonyong-choi/design-tokens/ui/icon-data.mjs';
    import { pruneTokens } from '@woonyong-choi/design-tokens/ui/build/prune-tokens.mjs';
    import { DiagramEmbed, DiagramFrame } from '@woonyong-choi/design-tokens/diagram';
    import { trusted } from '@woonyong-choi/design-tokens/components';
    const require = createRequire(import.meta.url);
    const catalog = getIconCatalog();
    assert.equal(Object.keys(catalog.icons).length, 57);
    for (const name of [...Object.keys(catalog.icons), ...Object.keys(catalog.aliases)]) assert.match(readIcon(name), /<svg/);
    for (const role of Object.keys(ICON_ROLES.controls)) assert.match(String(ControlIcon(role)), /<svg/);
    assert.equal(Object.keys(ICON_DATA).length, 9);
    for (const name of 'apigw bastion cache cdn db desktop dns function lb mobile monitoring mq region server vpn'.split(' ')) assert.throws(() => readIcon(name), /unknown icon/);
    assert.throws(() => ControlIcon('search'), /unknown controls/);
    assert.match(String(DiagramEmbed({src:'/diagram.html',title:'test',dimensions:{width:100,height:100}})), /iframe/);
    assert.match(DiagramFrame({ canvas: '<svg></svg>', source: 'diagram', labels: ['one'] }), /data-tool="copy"/);
    assert.equal(typeof trusted, 'function');
    for (const entry of ['runtime/document-navigation','ui/runtime/toolbar.js','ui/runtime/tabs.js','svg','js','components']) await import('@woonyong-choi/design-tokens/' + entry);
    await assert.rejects(import('@woonyong-choi/design-tokens/build/styles'), { code: 'ERR_MODULE_NOT_FOUND' });
    await assert.rejects(import('@woonyong-choi/design-tokens/ui/build/styles.mjs'), { code: 'ERR_MODULE_NOT_FOUND' });
    const { build } = await import(${JSON.stringify(pathToFileURL(join(ROOT, 'node_modules/esbuild/lib/main.js')).href)});
    const runtime = await build({ stdin: { contents: ['runtime/document','runtime/flows','runtime/video'].map(entry => 'import \"@woonyong-choi/design-tokens/' + entry + '\";').join('\\n'), resolveDir: process.cwd() }, bundle: true, write: false, platform: 'browser', format: 'esm' });
    assert.ok(runtime.outputFiles[0].text.includes('matchMedia'));
    for (const file of ['ui/html.mjs','ui/svg.mjs','ui/icons.mjs','ui/runtime/flows.js']) assert.ok(readFileSync(require.resolve('@woonyong-choi/design-tokens/' + file), 'utf8').length > 0);
    assert.match(pruneTokens(':root { --keep:red; --drop:blue }', '.x {color:var(--keep)}'), /--keep/);
    assert.doesNotMatch(pruneTokens(':root { --keep:red; --drop:blue }', '.x {color:var(--keep)}'), /--drop/);
  `], folder);
  const installed = JSON.parse(run('npm', ['ls', '--all', '--json'], folder));
  assert.ok(installed.dependencies['@woonyong-choi/design-tokens']);
  assert.equal(installed.problems, undefined);
  assert.deepEqual(Object.keys(installed.dependencies['@woonyong-choi/design-tokens'].dependencies), ['postcss']);
  for (const name of ['esbuild', '@esbuild']) assert.equal(existsSync(join(folder, 'node_modules', name)), false, name);
  const audit = JSON.parse(run('npm', ['audit', '--json'], folder));
  assert.equal(audit.metadata.vulnerabilities.total, 0);
  writeFileSync(join(folder, 'page.css'), '.page { color: #ff0000; }\n');
  const check = spawnSync(join(folder, 'node_modules/.bin/design-tokens-check'), ['page.css', '--tokens', 'node_modules/@woonyong-choi/design-tokens/dist/tokens.json'], { cwd: folder, encoding: 'utf8' });
  assert.equal(check.status, 1, check.stderr);
  assert.match(check.stdout, /#ff0000/);
}));
