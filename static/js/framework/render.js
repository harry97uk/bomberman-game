const renderElem = ({ tagName, attrs, children }) => {
  const $el = document.createElement(tagName);

  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      $el.setAttribute(k, v);
    }
  }

  if (children) {
    for (const child of children) {
      const $child = Render(child);
      $el.appendChild($child);
    }
  }

  return $el;
};

const Render = (vNode) => {
  if (typeof vNode === "string") {
    return document.createTextNode(vNode);
  }
  return renderElem(vNode);
};

const ReRender = ($rootEl, vDom) => {
  const newVDom = createVDom();
  const patch = diff(vDom, newVDom);
  patch($rootEl);
  return newVDom;
};

export default Render;
