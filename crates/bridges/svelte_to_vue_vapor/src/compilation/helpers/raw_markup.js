const $$raw_markup = (value, namespace) => {
  const template = namespace
    ? document.createElementNS(namespace, namespace.endsWith('svg') ? 'svg' : 'math')
    : document.createElement('template');
  template.innerHTML = value == null ? '' : value;
  return Array.from((namespace ? template : template.content).childNodes);
};
