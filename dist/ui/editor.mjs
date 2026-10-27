// 글 작성 화면의 공통 조각. 단추·여러 줄 입력·선택 상자·목록과 두 칸 배치를 한 곳에서 만든다.
import { escape, id, out, slot } from './html.mjs';

const BUTTON_VARIANTS = ['primary', 'secondary'];
const ACTION = /^[a-z][a-z-]*$/;

/** 동작 단추. `action`은 화면 스크립트가 찾는 이름(`data-action`)이다. */
export function Button({ label, variant = 'secondary', type = 'button', action, disabled = false, hidden = false }) {
  if (!BUTTON_VARIANTS.includes(variant)) throw new Error(`Unknown button variant: ${variant}`);
  if (!['button', 'submit'].includes(type)) throw new Error(`Unknown button type: ${type}`);
  if (action !== undefined && !ACTION.test(action)) throw new Error(`Invalid button action: ${action}`);
  return out(`<button type="${type}" class="app-button${variant === 'primary' ? ' is-primary' : ''}"${action ? ` data-action="${action}"` : ''}${disabled ? ' disabled' : ''}${hidden ? ' hidden' : ''}>${escape(label)}</button>`);
}

/** 이름표가 보이는 여러 줄 입력. `code: true`이면 고정폭 글꼴로 원문을 쓴다. */
export function TextArea({ id: name, name: field = name, label, value = '', placeholder = '', rows = 4, code = false, describedBy }) {
  if (!Number.isInteger(rows) || rows < 1) throw new Error('TextArea rows must be a positive integer');
  return out(`<label class="app-field-label" for="${id(name)}">${escape(label)}</label><textarea class="app-textarea${code ? ' is-code' : ''}" id="${name}" name="${escape(field)}" rows="${rows}"${placeholder ? ` placeholder="${escape(placeholder)}"` : ''}${describedBy ? ` aria-describedby="${id(describedBy)}"` : ''} spellcheck="${code ? 'false' : 'true'}">${escape(value)}</textarea>`);
}

/** 이름표가 보이는 선택 상자. `options`는 `{ value, label }`이다. */
export function Select({ id: name, name: field = name, label, options, value }) {
  if (!Array.isArray(options) || !options.length) throw new Error('Select requires options');
  return out(`<label class="app-field-label" for="${id(name)}">${escape(label)}</label><select class="app-select" id="${name}" name="${escape(field)}">${options.map(option => `<option value="${escape(option.value)}"${option.value === value ? ' selected' : ''}>${escape(option.label)}</option>`).join('')}</select>`);
}

/** 이름표와 입력, 도움말을 한 칸으로 묶는다. `control`은 TextInput·TextArea·Select 슬롯이다. */
export function Field({ control, hint, hintId }) {
  if (hint && !hintId) throw new Error('Field hint requires hintId');
  return out(`<div class="app-field">${slot(control, 'field control')}${hint ? `<p class="app-field-hint" id="${id(hintId)}">${escape(hint)}</p>` : ''}</div>`);
}

/** 단추를 한 줄로 놓는다. `items`는 Button 등 검증한 슬롯 목록이다. */
export function EditorActions({ items }) {
  if (!Array.isArray(items) || !items.length) throw new Error('EditorActions requires items');
  return out(`<div class="app-editor-actions">${items.map(item => slot(item, 'editor action')).join('')}</div>`);
}

/** 입력 칸을 세로로 쌓는 묶음. 탭 패널처럼 폼 바깥의 칸 묶음에 쓴다. */
export const EditorPanel = ({ body }) => out(`<div class="app-editor-panel">${slot(body, 'editor panel')}</div>`);

/** 편집할 항목 목록. 각 항목은 단추이며 `data-item`으로 고른다. `note`는 상태처럼 짧은 보조 글자다. */
export function EditorList({ label, items }) {
  return out(`<ul class="app-editor-list" aria-label="${escape(label)}">${items.map(item => `<li><button type="button" class="app-editor-item" data-item="${escape(item.id)}"${item.selected ? ' aria-current="true"' : ''}><span class="app-editor-item-title">${escape(item.title)}</span>${item.note ? `<span class="app-editor-item-note">${escape(item.note)}</span>` : ''}</button></li>`).join('')}</ul>`);
}

/** 왼쪽 목록과 오른쪽 편집 칸. 좁은 화면에서는 목록이 위로 온다. */
export function EditorLayout({ label, aside, main }) {
  return out(`<div class="app-editor"><aside class="app-editor-aside" aria-label="${escape(label)}">${slot(aside, 'editor aside')}</aside><div class="app-editor-main">${slot(main, 'editor main')}</div></div>`);
}
