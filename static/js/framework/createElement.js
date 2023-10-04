const CreateElement = (tagName, { attrs = {}, children = [] } = {}) => {
  return {
    tagName,
    attrs,
    children,
  };
};

export default CreateElement;
