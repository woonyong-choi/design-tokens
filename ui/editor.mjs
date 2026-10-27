// 글 작성 화면의 기본 조각: 단추, 여러 줄 입력, 입력 칸, 상태 칩, 들어가기 전 안내 카드.
import { escape, id, out, slot } from './html.mjs';

const BUTTON_VARIANTS = ['primary', 'secondary', 'quiet'];
const ACTION = /^[a-z][a-z-]*$/;
const STATES = { draft: '임시', private: '비공개', public: '공개' };

/** 동작 단추. `action`은 화면 스크립트가 찾는 이름(`data-action`)이다. `quiet`는 테두리 없는 글자 단추다. */
export function Button({ label, variant = 'secondary', type = 'button', action, disabled = false, hidden = false, pressed }) {
  if (!BUTTON_VARIANTS.includes(variant)) throw new Error(`Unknown button variant: ${variant}`);
  if (!['button', 'submit'].includes(type)) throw new Error(`Unknown button type: ${type}`);
  if (action !== undefined && !ACTION.test(action)) throw new Error(`Invalid button action: ${action}`);
  const variantClass = variant === 'secondary' ? '' : ` is-${variant}`;
  return out(`<button type="${type}" class="app-button${variantClass}"${action ? ` data-action="${action}"` : ''}${pressed === undefined ? '' : ` aria-pressed="${pressed}"`}${disabled ? ' disabled' : ''}${hidden ? ' hidden' : ''}>${escape(label)}</button>`);
}

/** 여러 줄 입력. `variant`는 field(회색 면), title(글 제목 크기), source(본문 원문)다. title은 내용 높이만큼 늘어난다. */
export function TextArea({ id: name, name: field = name, label, value = '', placeholder = '', rows = 4, variant = 'field', labelVisible = true, maxLength, describedBy }) {
  if (!['field', 'title', 'source'].includes(variant)) throw new Error(`Unknown textarea variant: ${variant}`);
  if (!Number.isInteger(rows) || rows < 1) throw new Error('TextArea rows must be a positive integer');
  if (maxLength !== undefined && (!Number.isInteger(maxLength) || maxLength < 1)) throw new Error('TextArea maxLength must be a positive integer');
  return out(`<label class="${labelVisible ? 'app-field-label' : 'app-sr'}" for="${id(name)}">${escape(label)}</label><textarea class="app-textarea${variant === 'field' ? '' : ` is-${variant}`}" id="${name}" name="${escape(field)}" rows="${rows}"${maxLength ? ` maxlength="${maxLength}"` : ''}${placeholder ? ` placeholder="${escape(placeholder)}"` : ''}${describedBy ? ` aria-describedby="${id(describedBy)}"` : ''} spellcheck="${variant === 'source' ? 'false' : 'true'}">${escape(value)}</textarea>`);
}

/** 이름표와 입력, 도움말을 한 칸으로 묶는다. `control`은 TextInput·TextArea 슬롯이다. */
export function Field({ control, hint, hintId }) {
  if (hint && !hintId) throw new Error('Field hint requires hintId');
  return out(`<div class="app-field">${slot(control, 'field control')}${hint ? `<p class="app-field-hint" id="${id(hintId)}">${escape(hint)}</p>` : ''}</div>`);
}

/** 글 상태 칩. 임시·비공개는 회색, 공개는 사이트 태그와 같은 파란 칩이다. */
export function EditorState({ state }) {
  if (!Object.hasOwn(STATES, state)) throw new Error(`Unknown editor state: ${state}`);
  return out(`<span class="app-editor-state is-${state}">${STATES[state]}</span>`);
}

/** 들어가기 전 안내 카드(로그인·설정 안내). 화면 가운데에 놓인다. `body`·`actions`·`footer`는 슬롯이다. */
export function EditorNotice({ title, body, actions, footer }) {
  return out(`<section class="app-editor-notice"><div class="app-editor-notice-card"><h1 class="app-editor-notice-title">${escape(title)}</h1>${slot(body, 'notice body')}${actions === undefined ? '' : slot(actions, 'notice actions')}${footer === undefined ? '' : `<div class="app-editor-notice-footer">${slot(footer, 'notice footer')}</div>`}</div></section>`);
}
