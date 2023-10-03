const RemoveChildElement = (parent, childToRemove) => {
  const indexToRemove = parent.children.findIndex((child) => {
    if (child.tagName === childToRemove.tagName) {
      for (const [k, v] of Object.entries(childToRemove.attrs)) {
        if (child.attrs[k] !== v) {
          return false;
        }
      }
      return true;
    }
    return false;
  });

  if (indexToRemove !== -1) {
    parent.children.splice(indexToRemove, 1);
  }
};

export default RemoveChildElement;
