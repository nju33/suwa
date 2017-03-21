import raf from 'raf';

export function wrapPage(el) {
  const wrapper = document.createElement('div');
  wrapper.classList = 'suwa page-wrapper';
  wrapper.appendChild(el);
  return wrapper;
}

export function calcOuterWidth(el) {
  const style = window.getComputedStyle(el);
  const props = [
    'width',
    'paddingLeft',
    'paddingRight',
    'borderLeftWidth',
    'borderRightWidth',
    'marginLeft',
    'marginRight'
  ];

  return props.reduce((result, prop) => {
    result += getNumber(style[prop]);
    return result;
  }, 0);

  function getNumber(cssVal) {
    const matches = cssVal.match(/^\d+/);
    if (matches === null) {
      return 0;
    }
    return Number(matches[0]);
  }
}

export function offTransitionAll(parent) {
  const els = Array.prototype.slice.call(parent.children)
    .forEach(el => {
      el.style.transition = 'none';
    });
  return () => {
    els.forEach(el => {
      el.style.transition = '';
    });
  };
}

export function offTransition(el, cb) {
  raf(() => {
    el.style.transition = 'none';

    const reset = () => {
      raf(() => {
        el.style.transition = '';
      });
    };

    raf(() => {
      cb(reset);
    });
  });
}

export function filterChildren(parent, ignoreClass) {
  const result = Array.prototype.slice.call(parent.children).filter(el => {
    if (!ignoreClass) {
      return true;
    }
    return !el.classList.contains(ignoreClass);
  });
  return result;
}

export function circulate(els, offset = 0) {
  // const idx = els.findIndex(el => {
  //   Number(el.getAttribute('data-nth')) === offset
  // });
  // const arr = els.concat(els).slice(els.findIndex(offset), els.length);
  const middleIdx = Math.floor((els.length - 1) / 2);
  const heads = els.slice(0, middleIdx + 1);
  const tails = els.slice(middleIdx + 1, els.length);
  return tails.concat(heads);
}
