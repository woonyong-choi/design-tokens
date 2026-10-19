import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

if (!process.argv[2]) throw new Error('usage: node test/document-widget-ids.mjs <document-engine index.js>');
const { parseDocument, renderDocument } = await import(pathToFileURL(resolve(process.argv[2])).href);
const source = '# 제목\n\n:::tabs\n@tab Mac\n\n설명 :tip[용어]{text="뜻"} 각주[^n]\n\n@tab Windows\n\n윈도우\n\n:::end\n\n[^n]: 각주 본문\n';
const idsOf = html => [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
const outputs = [];
for (const pageId of ['native-one', 'native-two']) {
  const parsed = await parseDocument(source, { id: 'diagnostic', pageId });
  const rendered = await renderDocument(parsed, { id: 'diagnostic-only' });
  assert.equal(rendered.diagnostics.length, 0);
  const ids = idsOf(rendered.html);
  const references = [...rendered.html.matchAll(/(?:aria-controls|aria-labelledby|popovertarget)="([^"]+)"|href="#([^"]+)"/g)].flatMap(match => (match[1] ?? match[2]).split(/\s+/));
  assert.equal(ids.length, 8, 'fixture covers a heading, two panels, two tab buttons, tooltip and both footnote endpoints');
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.every(id => id.includes(pageId)));
  assert.ok(references.every(reference => ids.includes(reference)));
  outputs.push(new Set(ids));
  console.log(`parseDocument pageId ${pageId}: ${ids.length} IDs and ${references.length} references isolated`);
}
assert.equal([...outputs[0]].filter(id => outputs[1].has(id)).length, 0);
const diagnosticOnly = [];
for (const id of ['diagnostic-one', 'diagnostic-two']) {
  const parsed = await parseDocument(source, { id });
  diagnosticOnly.push(idsOf((await renderDocument(parsed, { id })).html));
}
assert.ok(diagnosticOnly[0].some(id => diagnosticOnly[1].includes(id)), 'diagnostic id alone does not namespace DOM IDs');
