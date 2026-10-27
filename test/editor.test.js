import assert from 'node:assert/strict';
import test from 'node:test';
import { Button, EditorActions, EditorPanel, EditorLayout, EditorList, Field, Select, TextArea, TextInput, trusted } from '../dist/ui/index.mjs';

test('editor_controls_escape_text_and_reject_unknown_values', () => {
  assert.equal(String(Button({ label: '<저장>', variant: 'primary', action: 'save' })), '<button type="button" class="app-button is-primary" data-action="save">&lt;저장&gt;</button>');
  assert.throws(() => Button({ label: 'x', variant: 'danger' }), /variant/);
  assert.throws(() => Button({ label: 'x', action: 'Save()' }), /action/);
  const area = String(TextArea({ id: 'body', label: '본문', value: '</textarea><b>', code: true }));
  assert.match(area, /class="app-textarea is-code"/);
  assert.match(area, /&lt;\/textarea&gt;&lt;b&gt;<\/textarea>$/);
  assert.match(String(Select({ id: 'state', label: '상태', options: [{ value: 'draft', label: '초안' }, { value: 'public', label: '공개' }], value: 'public' })), /<option value="public" selected>공개<\/option>/);
  assert.throws(() => Field({ control: trusted(''), hint: '도움말' }), /hintId/);
  assert.match(String(TextInput({ id: 'date', label: '발행일', type: 'date', labelVisible: true })), /^<label class="app-field-label" for="date">발행일<\/label><input class="app-input" type="date"/);
});

test('editor_list_marks_selected_item_and_layout_keeps_slots', () => {
  const list = String(EditorList({ label: '글', items: [{ id: 'a.md', title: '가', note: '초안', selected: true }, { id: 'b.md', title: '나' }] }));
  assert.match(list, /data-item="a.md" aria-current="true"/);
  assert.doesNotMatch(list.split('</li>')[1], /aria-current/);
  assert.match(String(EditorLayout({ label: '글 목록', aside: trusted('<p>목록</p>'), main: trusted('<p>편집</p>') })), /<aside class="app-editor-aside" aria-label="글 목록"><p>목록<\/p><\/aside><div class="app-editor-main"><p>편집<\/p><\/div>/);
  assert.throws(() => EditorLayout({ label: 'x', aside: '<p>', main: trusted('') }), /trusted/);
  assert.equal(String(EditorActions({ items: [Button({ label: '저장' })] })), '<div class="app-editor-actions"><button type="button" class="app-button">저장</button></div>');
  assert.equal(String(EditorPanel({ body: trusted('<p>칸</p>') })), '<div class="app-editor-panel"><p>칸</p></div>');
});
