const AddAttributesToElem = (vNode, attrs = {}) => {
  for (const [k, v] of Object.entries(attrs)) {
    vNode.attrs[k] = v;
  }
};

export default AddAttributesToElem;
