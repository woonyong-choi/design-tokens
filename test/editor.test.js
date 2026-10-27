import assert from 'node:assert/strict';
import test from 'node:test';
import { Button, EditorNotice, EditorActions, EditorBar, EditorLayout, EditorList, EditorPanel, EditorState, Field, FieldRow, Select, TextArea, TextInput, trusted } from '../dist/ui/index.mjs';

test('editor_controls_escape_text_and_reject_unknown_values', () => {
  assert.equal(String(Button({ label: '<저장>', variant: 'primary', action: 'save' })), '<button type="button" class="app-button is-primary" data-action="save">&lt;저장&gt;</button>');
  assert.match(String(Button({ label: '미리보기', variant: 'quiet', action: 'view-preview', pressed: false })), /class="app-button is-quiet" data-action="view-preview" aria-pressed="false"/);
  assert.throws(() => Button({ label: 'x', variant: 'danger' }), /variant/);
  assert.throws(() => Button({ label: 'x', action: 'Save()' }), /action/);
  const area = String(TextArea({ id: 'body', label: '본문', value: '</textarea><b>', code: true }));
  assert.match(area, /class="app-textarea is-code"/);
  assert.match(area, /&lt;\/textarea&gt;&lt;b&gt;<\/textarea>$/);
  assert.match(String(TextArea({ id: 'lead', label: '요약', variant: 'plain', labelVisible: false })), /^<label class="app-sr" for="lead">요약<\/label><textarea class="app-textarea is-plain"/);
  assert.throws(() => TextArea({ id: 'x', label: 'x', variant: 'rich' }), /variant/);
  assert.match(String(TextArea({ id: 'title', label: '제목', variant: 'title', rows: 1, labelVisible: false, value: '"따옴표"' })), /class="app-textarea is-title" id="title" name="title" rows="1" spellcheck="true">&quot;따옴표&quot;<\/textarea>$/);
  assert.match(String(Select({ id: 'state', label: '상태', options: [{ value: 'draft', label: '초안' }, { value: 'public', label: '공개' }], value: 'public' })), /<option value="public" selected>공개<\/option>/);
  assert.throws(() => Field({ control: trusted(''), hint: '도움말' }), /hintId/);
  assert.match(String(FieldRow({ fields: [Field({ control: trusted('<i></i>') })] })), /^<div class="app-field-row"><div class="app-field"><i><\/i><\/div><\/div>$/);
  assert.match(String(TextInput({ id: 'date', label: '발행일', type: 'date', labelVisible: true })), /^<label class="app-field-label" for="date">발행일<\/label><input class="app-input" type="date"/);
  assert.equal(String(EditorState({ state: 'public' })), '<span class="app-editor-state is-public">공개</span>');
  assert.throws(() => EditorState({ state: 'hidden' }), /state/);
});

test('editor_list_bar_and_layout_keep_slots_and_views', () => {
  const list = String(EditorList({ label: '글', items: [{ id: 'a.md', title: '가', state: 'draft', date: '2026-10-19', selected: true }, { id: 'b.md', title: '<나>' }] }));
  assert.match(list, /data-item="a.md" aria-current="true"><span class="app-editor-item-title">가<\/span><span class="app-editor-item-meta"><span class="app-editor-state is-draft">초안<\/span><span>2026-10-19<\/span>/);
  assert.match(list, /&lt;나&gt;/);
  assert.doesNotMatch(list.split('</li>')[1], /aria-current/);
  assert.equal(String(EditorBar({ title: '글 관리', home: { href: '/', label: '사이트' }, status: trusted('<p>상태</p>') })), '<header class="app-editor-bar"><a class="app-editor-home" href="/">사이트</a><span class="app-editor-title">글 관리</span><p>상태</p></header>');
  const layout = String(EditorLayout({ label: '글 목록', aside: trusted('<p>목록</p>'), main: trusted('<p>편집</p>'), preview: trusted('<p>보기</p>') }));
  assert.match(layout, /^<div class="app-editor" data-view="edit"><aside class="app-editor-aside" aria-label="글 목록"><p>목록<\/p><\/aside><div class="app-editor-main"><p>편집<\/p><\/div><section class="app-editor-preview" aria-label="미리보기"><p>보기<\/p><\/section><\/div>$/);
  assert.throws(() => EditorLayout({ label: 'x', aside: trusted(''), main: trusted(''), view: 'grid' }), /view/);
  assert.throws(() => EditorLayout({ label: 'x', aside: '<p>', main: trusted('') }), /trusted/);
  assert.equal(String(EditorActions({ items: [Button({ label: '저장' })] })), '<div class="app-editor-actions"><button type="button" class="app-button">저장</button></div>');
  assert.match(String(EditorNotice({ title: '<글>', body: trusted('<p>안내</p>'), footer: trusted('<a href="/">돌아가기</a>') })), /^<section class="app-editor-notice"><div class="app-editor-notice-card"><h1 class="app-editor-notice-title">&lt;글&gt;<\/h1><p>안내<\/p><div class="app-editor-notice-footer"><a href="\/">돌아가기<\/a><\/div><\/div><\/section>$/);
  assert.equal(String(EditorPanel({ body: trusted('<p>칸</p>') })), '<div class="app-editor-panel"><p>칸</p></div>');
});
