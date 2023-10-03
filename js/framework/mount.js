const Mount = ($node, $target) => {
  $target.replaceWith($node);
  return $node;
};

export default Mount;
