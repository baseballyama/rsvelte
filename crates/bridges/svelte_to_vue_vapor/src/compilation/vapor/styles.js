const $$inject_styles = (instance, hash, code) => {
  let target = document.head;
  while (instance) {
    if (instance.ce?.shadowRoot) {
      target = instance.ce.shadowRoot;
      break;
    }
    instance = instance.parent;
  }
  if (target.querySelector('#' + hash)) return;
  const style = document.createElement('style');
  style.id = hash;
  style.textContent = code;
  target.appendChild(style);
};
