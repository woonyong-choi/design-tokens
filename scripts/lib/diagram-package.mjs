import { createHash } from 'node:crypto';

const POLICY = Object.freeze({
  icons: Object.freeze('user admin nginx postgresql redis git github check warning close ellipsis platform-google platform-google-cloud platform-google-drive platform-kubernetes platform-docker platform-redis platform-postgresql platform-aws-ec2 platform-aws-lambda platform-aws-ecs platform-aws-eks platform-aws-s3 platform-aws-rds platform-aws-dynamodb platform-aws-elasticache platform-aws-sqs platform-aws-sns platform-aws-api-gateway platform-aws-elb platform-aws-route53 platform-aws-cloudfront platform-aws-vpc platform-aws-iam platform-aws-cloudwatch'.split(' ')),
  controls: Object.freeze('copy download maximize-2 minimize-2 check alert zoom-in zoom-out scan'.split(' ')),
  files: Object.freeze(['tokens.css', 'tokens.js', 'tokens.json', 'tokens.dark.json', 'styles/tabs.css', 'styles/toolbar.css', 'styles/diagram-embed.css']),
  // CSS 축소 도우미(`/build/styles`)는 웹 사이트 빌드용이며 도표 소비자의 실행 경로가 아님. 이 파일만 esbuild를 import함
  excludedUi: Object.freeze(['ui/build/styles.mjs']),
});
const BARE_IMPORT = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)['"]([^'"./][^'"]*)['"]/g;
const packageName = specifier => specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0];
const serialize = value => JSON.stringify(value, null, 2) + '\n';
const digest = value => createHash('sha256').update(value).digest('hex');

export function buildDiagramPackage({ packageJson, license, fullFiles }) {
  const read = name => {
    if (!Object.hasOwn(fullFiles, name)) throw new Error(`missing diagram input: ${name}`);
    return Buffer.from(fullFiles[name]);
  };
  const catalog = JSON.parse(read('assets/icons/catalog.json'));
  const fullManifest = JSON.parse(read('manifest.json'));
  const canonical = name => {
    const target = Object.hasOwn(catalog.icons, name) ? name : catalog.aliases[name];
    if (!target || !Object.hasOwn(catalog.icons, target)) throw new Error(`unknown diagram icon: ${name}`);
    return target;
  };
  const controls = Object.fromEntries(POLICY.controls.map(role => {
    if (!Object.hasOwn(catalog.controls, role)) throw new Error(`missing diagram control: ${role}`);
    return [role, catalog.controls[role]];
  }));
  const names = [...new Set([...POLICY.icons, ...Object.values(controls)].map(canonical))].sort();
  const selected = new Set(names);
  const icons = Object.fromEntries(names.map(name => [name, catalog.icons[name]]));
  const aliases = Object.fromEntries(Object.entries(catalog.aliases).filter(([, target]) => selected.has(target)));
  const brands = Object.fromEntries(Object.entries(catalog.brands).filter(([name]) => selected.has(name)));
  const profileCatalog = { ...catalog, icons, aliases, brands, controls, social: {}, articles: {}, kinds: {} };
  const files = new Map();
  for (const name of POLICY.files) files.set(name, read(name));
  for (const name of Object.keys(fullFiles).sort()) {
    if ((name.startsWith('ui/') && !POLICY.excludedUi.includes(name)) || name.startsWith('styles/diagram/')) files.set(name, read(name));
  }
  for (const { file } of Object.values(icons)) {
    if (!/^[a-z][a-z0-9-]*\/[a-z0-9][a-z0-9-]*\.svg$/.test(file)) throw new Error(`invalid diagram icon path: ${file}`);
    files.set(`assets/icons/${file}`, read(`assets/icons/${file}`));
  }
  const notices = [...catalog.libraries, ...Object.values(catalog.brands)].map(item => item.notice).filter(Boolean);
  for (const notice of notices) {
    if (notice.split('/').some(part => !part || part === '.' || part === '..') || notice.includes('\\')) throw new Error(`invalid icon notice: ${notice}`);
    files.set(`assets/icons/${notice}`, read(`assets/icons/${notice}`));
  }
  files.set('assets/icons/catalog.json', Buffer.from(serialize(profileCatalog)));
  const roles = { controls, articles: {}, social: {} };
  const graphics = Object.fromEntries([...new Set(Object.values(controls).map(canonical))].sort().map(name => [name, read(`assets/icons/${icons[name].file}`).toString()]));
  files.set('ui/icon-data.mjs', Buffer.from(`export const ICON_ROLES = Object.freeze(${serialize(roles).trim()});\nexport const ICON_DATA = Object.freeze(${serialize(graphics).trim()});\n`));
  const hashes = Object.fromEntries([...files].sort(([a], [b]) => a.localeCompare(b)).map(([name, value]) => [name, digest(value)]));
  files.set('manifest.json', Buffer.from(serialize({ ...fullManifest, files: hashes, contentHash: digest(serialize(hashes)) })));
  const { scripts, devDependencies, overrides, ...pkg } = JSON.parse(packageJson);
  const used = new Set();
  for (const [name, value] of files) {
    if (!/\.(?:mjs|js)$/.test(name)) continue;
    for (const [, specifier] of value.toString().matchAll(BARE_IMPORT)) if (!specifier.startsWith('node:') && packageName(specifier) !== pkg.name) used.add(packageName(specifier));
  }
  for (const name of used) if (!Object.hasOwn(pkg.dependencies ?? {}, name)) throw new Error(`undeclared diagram dependency: ${name}`);
  pkg.dependencies = Object.fromEntries(Object.entries(pkg.dependencies ?? {}).filter(([name]) => used.has(name)));
  pkg.exports = Object.fromEntries(Object.entries(pkg.exports).filter(([, target]) => {
    if (target === './package.json') return true;
    if (target.includes('*')) {
      if (![...files.keys()].some(name => `./dist/${name}`.startsWith(target.split('*')[0]))) throw new Error(`empty diagram export: ${target}`);
      return true;
    }
    return files.has(target.replace(/^\.\/dist\//, ''));
  }));
  for (const target of Object.values(pkg.bin)) if (!files.has(target.replace(/^dist\//, ''))) throw new Error(`missing diagram bin: ${target}`);
  pkg.designTokensProfile = { name: 'diagram', icons: names, controls: [...POLICY.controls].sort(), sourceContentHash: fullManifest.contentHash };
  if (!license?.length) throw new Error('missing diagram license');
  return new Map([
    ['package.json', Buffer.from(serialize(pkg))],
    ['LICENSE', Buffer.from(license)],
    ...[...files].map(([name, value]) => [`dist/${name}`, value]),
  ]);
}
