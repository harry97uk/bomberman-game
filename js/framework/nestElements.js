const NestElements = (parentVNode, childVNode, index = 0) => {
  parentVNode.children.splice(index, 0, childVNode);
};

export default NestElements;
