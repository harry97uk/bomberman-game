export const findElementInVDom = (vDom, tagName, attrs = {}) => {
  let counter = -1;
  if (vDom.tagName === tagName) {
    if (attrs) {
      counter = Object.entries(attrs).length;
      for (const [key, value] of Object.entries(attrs)) {
        if (vDom.attrs[key] !== value) {
          break;
        }
        counter--;
      }
    }
    if (counter == 0) {
      return vDom;
    }
  }

  if (vDom.children) {
    for (const child of vDom.children) {
      const result = findElementInVDom(child, tagName, attrs);
      if (result) {
        return result;
      }
    }
  }

  return null;
};
