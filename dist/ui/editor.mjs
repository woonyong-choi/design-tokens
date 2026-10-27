// 글 작성 화면의 공통 조각. 상단 막대, 글 목록, 편집 칸, 실시간 미리보기 칸과 입력·단추를 한 곳에서 만든다.
import { escape, id, out, safeUrl, slot } from './html.mjs';

const BUTTON_VARIANTS = ['primary', 'secondary', 'quiet'];
const ACTION = /^[a-z][a-z-]*$/;
const STATES = { draft: '초안', public: '공개' };

/** 동작 단추. `action`은 화면 스크립트가 찾는 이름(`data-action`)이다. `quiet`는 테두리 없는 보조 단추다. */
export function Button({ label, variant = 'secondary', type = 'button', action, disabled = false, hidden = false, pressed }) {
  if (!BUTTON_VARIANTS.includes(variant)) throw new Error(`Unknown button variant: ${variant}`);
  if (!['button', 'submit'].includes(type)) throw new Error(`Unknown button type: ${type}`);
  if (action !== undefined && !ACTION.test(action)) throw new Error(`Invalid button action: ${action}`);
  const variantClass = variant === 'secondary' ? '' : ` is-${variant}`;
  return out(`<button type="${type}" class="app-button${variantClass}"${action ? ` data-action="${action}"` : ''}${pressed === undefined ? '' : ` aria-pressed="${pressed}"`}${disabled ? ' disabled' : ''}${hidden ? ' hidden' : ''}>${escape(label)}</button>`);
}

/** 이름표가 보이는 여러 줄 입력. `variant`는 field(회색 면), title(글 제목 크기), plain(도입문 크기 요약), code(본문 원문)다. title·plain은 내용 높이만큼 늘어난다. */
export function TextArea({ id: name, name: field = name, label, value = '', placeholder = '', rows = 4, variant = 'field', code = false, labelVisible = true, describedBy }) {
  const kind = code ? 'code' : variant;
  if (!['field', 'title', 'plain', 'code'].includes(kind)) throw new Error(`Unknown textarea variant: ${kind}`);
  if (!Number.isInteger(rows) || rows < 1) throw new Error('TextArea rows must be a positive integer');
  return out(`<label class="${labelVisible ? 'app-field-label' : 'app-sr'}" for="${id(name)}">${escape(label)}</label><textarea class="app-textarea${kind === 'field' ? '' : ` is-${kind}`}" id="${name}" name="${escape(field)}" rows="${rows}"${placeholder ? ` placeholder="${escape(placeholder)}"` : ''}${describedBy ? ` aria-describedby="${id(describedBy)}"` : ''} spellcheck="${kind === 'code' ? 'false' : 'true'}">${escape(value)}</textarea>`);
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

/** 여러 입력 칸을 한 줄에 나란히 둔다. 좁은 화면에서는 아래로 쌓는다. */
export function FieldRow({ fields }) {
  if (!Array.isArray(fields) || !fields.length) throw new Error('FieldRow requires fields');
  return out(`<div class="app-field-row">${fields.map(item => slot(item, 'field')).join('')}</div>`);
}

/** 단추를 한 줄로 놓는다. `items`는 Button 등 검증한 슬롯 목록이다. */
export function EditorActions({ items }) {
  if (!Array.isArray(items) || !items.length) throw new Error('EditorActions requires items');
  return out(`<div class="app-editor-actions">${items.map(item => slot(item, 'editor action')).join('')}</div>`);
}

/** 입력 칸을 세로로 쌓는 묶음. */
export const EditorPanel = ({ body }) => out(`<div class="app-editor-panel">${slot(body, 'editor panel')}</div>`);

/** 상태 칩. 초안은 회색, 공개는 사이트 태그와 같은 파란 칩이다. */
export function EditorState({ state }) {
  if (!Object.hasOwn(STATES, state)) throw new Error(`Unknown editor state: ${state}`);
  return out(`<span class="app-editor-state is-${state}">${STATES[state]}</span>`);
}

/** 편집할 항목 목록. 항목은 `{ id, title, state, date, selected }`이며 단추의 `data-item`으로 고른다. */
export function EditorList({ label, items }) {
  return out(`<ul class="app-editor-list" aria-label="${escape(label)}">${items.map(item => `<li><button type="button" class="app-editor-item" data-item="${escape(item.id)}"${item.selected ? ' aria-current="true"' : ''}><span class="app-editor-item-title">${escape(item.title)}</span><span class="app-editor-item-meta">${item.state ? EditorState({ state: item.state }) : ''}${item.date ? `<span>${escape(item.date)}</span>` : ''}</span></button></li>`).join('')}</ul>`);
}

/** 작성 화면 상단 막대: 사이트로 돌아가는 링크, 화면 이름, 상태 글자, 동작 단추. */
export function EditorBar({ title, home, status, actions }) {
  return out(`<header class="app-editor-bar">${home ? `<a class="app-editor-home" href="${safeUrl(home.href)}">${escape(home.label)}</a>` : ''}<span class="app-editor-title">${escape(title)}</span>${status === undefined ? '' : slot(status, 'editor status')}${actions === undefined ? '' : slot(actions, 'editor actions')}</header>`);
}

/** 작성 화면에 들어가기 전 안내 카드(로그인·설정 안내). 화면 가운데에 놓인다. `body`·`actions`는 슬롯이다. */
export function EditorNotice({ title, body, actions, footer }) {
  return out(`<section class="app-editor-notice"><div class="app-editor-notice-card"><h1 class="app-editor-notice-title">${escape(title)}</h1>${slot(body, 'notice body')}${actions === undefined ? '' : slot(actions, 'notice actions')}${footer === undefined ? '' : `<div class="app-editor-notice-footer">${slot(footer, 'notice footer')}</div>`}</div></section>`);
}

/**
 * 작성 화면 전체. 위 막대, 왼쪽 목록, 가운데 편집 칸, 오른쪽 실시간 미리보기 칸이다.
 * 넓은 화면에서는 세 칸을 함께 보이고, 좁을수록 `data-view`(list·edit·preview)에 맞는 칸만 보인다.
 */
export function EditorLayout({ label, bar, aside, main, preview, view = 'edit' }) {
  if (!['list', 'edit', 'preview'].includes(view)) throw new Error(`Unknown editor view: ${view}`);
  return out(`<div class="app-editor" data-view="${view}">${bar === undefined ? '' : slot(bar, 'editor bar')}<aside class="app-editor-aside" aria-label="${escape(label)}">${slot(aside, 'editor aside')}</aside><div class="app-editor-main">${slot(main, 'editor main')}</div>${preview === undefined ? '' : `<section class="app-editor-preview" aria-label="미리보기">${slot(preview, 'editor preview')}</section>`}</div>`);
}
