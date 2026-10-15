import test from 'node:test';
import assert from 'node:assert/strict';
import * as ui from '../dist/ui/index.mjs';

const project = { href: '/project/', title: 'Title <', description: 'Description &', icon: ui.trusted('<span class="app-content-icon"></span>'), links: [{ href: '/guide/?a=1&b=2', title: 'Guide <' }] };

test('project_list_keeps_cards_and_related_links_in_one_owned_section', () => {
  assert.equal(String(ui.ProjectList({ title: 'Projects &', projects: [project] })), '<section class="app-knowledge-section"><div class="app-section-heading"><h2>Projects &amp;</h2></div><div class="app-project-grid"><article class="app-project-entry"><a class="app-knowledge-card" href="/project/"><span class="app-content-icon"></span><h3>Title &lt;</h3><p>Description &amp;</p></a><div class="app-project-links"><a href="/guide/?a=1&amp;b=2">Guide &lt; →</a></div></article></div></section>');
  for (const name of ['app-project-grid', 'app-project-entry', 'app-project-links', 'app-knowledge-card']) assert.ok(ui.OWNED_CLASSES.includes(name));
});

test('project_list_checks_card_and_related_urls_and_requires_trusted_icons', () => {
  for (const href of ['javascript:alert(1)', '//external.test/', '/bad path']) {
    assert.throws(() => ui.ProjectList({ projects: [{ ...project, href }] }), /Unsupported URL/);
    assert.throws(() => ui.ProjectList({ projects: [{ ...project, links: [{ href, title: 'Guide' }] }] }), /Unsupported URL/);
  }
  assert.throws(() => ui.ProjectList({ projects: [{ ...project, icon: '<svg />' }] }), /icon must be trusted/);
  const plain = String(ui.ProjectList({ title: 'Projects', projects: [{ ...project, icon: undefined, links: [] }] }));
  assert.doesNotMatch(plain, /app-content-icon/);
  assert.match(plain, /<div class="app-project-links"><\/div>/);
});
