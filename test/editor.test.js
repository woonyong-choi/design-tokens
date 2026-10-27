import assert from 'node:assert/strict';
import test from 'node:test';
import { AdminDock, AdminDrafts, AdminLogin, Button, Dialog, Field, PostOwnerActions, PublishScreen, TagInput, TextArea, TextInput, Toast, WriteScreen, WriteToolbar, trusted } from '../dist/ui/index.mjs';

test('editor_controls_escape_text_and_reject_unknown_values', () => {
  assert.equal(String(Button({ label: '<저장>', variant: 'primary', action: 'save' })), '<button type="button" class="app-button is-primary" data-action="save">&lt;저장&gt;</button>');
  assert.throws(() => Button({ label: 'x', variant: 'danger' }), /variant/);
  assert.throws(() => Button({ label: 'x', action: 'Save()' }), /action/);
  assert.match(String(TextArea({ id: 'body', label: '본문', value: '</textarea><b>', variant: 'source', labelVisible: false })), /^<label class="app-sr" for="body">본문<\/label><textarea class="app-textarea is-source"[^>]*spellcheck="false">&lt;\/textarea&gt;&lt;b&gt;<\/textarea>$/);
  assert.match(String(TextArea({ id: 'd', label: '요약', maxLength: 150 })), /maxlength="150"/);
  assert.throws(() => TextArea({ id: 'x', label: 'x', variant: 'rich' }), /variant/);
  assert.throws(() => Field({ control: trusted(''), hint: '도움말' }), /hintId/);
  assert.match(String(TextInput({ id: 'tag', label: '태그', surface: 'bare' })), /class="app-input is-bare"/);
  assert.match(String(AdminLogin({ title: '<글 관리>', body: trusted('<p>안내</p>'), actions: Button({ label: '로그인', action: 'signin' }) })), /^<section class="app-admin-login"><h1 class="app-post-title">&lt;글 관리&gt;<\/h1><div class="app-admin-login-body"><p>안내<\/p><\/div><div class="app-admin-login-actions"><button/);
});

test('admin_dock_drafts_and_owner_actions_use_actions_scripts_find', () => {
  const dock = String(AdminDock({ count: 3 }));
  assert.match(dock, /data-action="open-drafts" aria-expanded="false" aria-controls="admin-drafts">임시 글<span class="app-admin-count" data-admin-count>3<\/span>/);
  assert.match(dock, /class="app-admin-fab" data-action="new-post" aria-label="새 글 쓰기"/);
  assert.throws(() => AdminDock({ count: -1 }), /count/);
  assert.match(String(AdminDrafts({ items: [{ id: 'publish/a.md', title: '<가>', date: '2026-10-27' }] })), /data-item="publish\/a.md"><span class="app-admin-item-title">&lt;가&gt;<\/span><span class="app-admin-item-meta">2026-10-27 임시저장<\/span>/);
  assert.match(String(AdminDrafts({ items: [] })), /임시저장한 글이 없습니다/);
  assert.equal(String(PostOwnerActions()), '<span class="app-post-owner"><button type="button" data-action="edit-post">수정</button><button type="button" data-action="delete-post">삭제</button></span>');
});

test('write_and_publish_screens_start_hidden_with_named_controls', () => {
  const write = String(WriteScreen({ preview: trusted('<div data-preview></div>') }));
  assert.match(write, /^<div class="app-write" id="write-screen" role="dialog" aria-modal="true" aria-label="글 쓰기" hidden>/);
  for (const name of ['write-screen-title', 'write-screen-tag', 'write-screen-body']) assert.match(write, new RegExp(`id="${name}"`));
  for (const action of ['close-write', 'save-draft', 'open-publish']) assert.match(write, new RegExp(`data-action="${action}"`));
  assert.doesNotMatch(write, /app-write-rule/);
  assert.match(write, /<section class="app-write-preview" aria-label="미리보기"><div data-preview><\/div><\/section>/);
  const tools = String(WriteToolbar());
  assert.deepEqual([...tools.matchAll(/data-format="([a-z0-9]+)"/g)].map(match => match[1]), ['h1', 'h2', 'h3', 'h4', 'bold', 'italic', 'strike', 'quote', 'link', 'image', 'code']);
  assert.match(String(TagInput({ id: 'tag', label: '태그', tags: ['SQL', '<b>'] })), /<button type="button" class="app-tag" data-tag="SQL"[^>]*>SQL<\/button><button type="button" class="app-tag" data-tag="&lt;b&gt;"/);
  const publish = String(PublishScreen({ card: trusted('<article></article>') }));
  assert.match(publish, /role="dialog" aria-modal="true" aria-label="출간 설정" hidden/);
  assert.match(publish, /<div class="app-publish-card" data-publish-card><article><\/article><\/div>/);
  assert.doesNotMatch(publish, /data-visibility|비공개/);
  for (const action of ['upload-thumbnail', 'remove-thumbnail', 'close-publish', 'publish']) assert.match(publish, new RegExp(`data-action="${action}"`));
  assert.match(publish, /maxlength="150"/);
  assert.match(String(Dialog({ id: 'confirm', title: '삭제', body: '<글>을 지울까요?', actions: [Button({ label: '취소', action: 'cancel' })] })), /role="alertdialog"[^>]*hidden><div class="app-dialog-card"><h2 class="app-dialog-title" id="confirm-title">삭제<\/h2><p class="app-dialog-body" data-dialog-body>&lt;글&gt;을 지울까요\?<\/p>/);
  assert.equal(String(Toast()), '<div class="app-toast" role="status" aria-live="polite" hidden></div>');
});
