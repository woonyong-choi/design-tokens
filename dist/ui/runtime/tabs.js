/** 탭의 선택 상태와 키보드 이동. 패널의 내용과 재생 여부는 사용하는 쪽이 정한다. */
export function bindTabs(container, onSelect) {
  const buttons = [...container.querySelectorAll(':scope > [role=tab]')];
  const listeners = [];
  const select = (index) => {
    if (!buttons[index]) return;
    buttons.forEach((button, at) => {
      button.setAttribute('aria-selected', String(at === index));
      button.tabIndex = at === index ? 0 : -1;
    });
  };
  buttons.forEach((button, index) => {
    const click = () => { select(index); onSelect(index); };
    button.addEventListener('click', click);
    listeners.push(() => button.removeEventListener('click', click));
  });
  const keydown = (event) => {
    const current = buttons.indexOf(event.target);
    if (current < 0) return;
    const next = { ArrowRight: (current + 1) % buttons.length, ArrowLeft: (current + buttons.length - 1) % buttons.length, Home: 0, End: buttons.length - 1 }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    buttons[next].click();
    buttons[next].focus();
  };
  container.addEventListener('keydown', keydown);
  listeners.push(() => container.removeEventListener('keydown', keydown));
  return { buttons, select, dispose: () => listeners.splice(0).forEach(remove => remove()) };
}
