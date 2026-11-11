const $$groups = new WeakMap();
const $$group_checked = (value, option, checkbox) => checkbox ? value != null && value.includes(option) : value === option;
const $$group_members = new WeakMap();
const $$group = (element, owner, key, property, getter, setter, option) => {
  element.__value = option;
  const checkbox = element.type === 'checkbox';
  let groups = $$groups.get(owner);
  if (!groups) { groups = new Map(); $$groups.set(owner, groups); }
  const name = property === null ? null : typeof property === 'symbol' ? property : String(property);
  let properties = groups.get(key);
  if (!properties) { properties = new Map(); groups.set(key, properties); }
  let group = properties.get(name);
  if (!group) { group = new Set(); properties.set(name, group); }
  const previous = $$group_members.get(element);
  if (previous?.group !== group) {
    if (previous) previous.dispose();
    group.add(element);
    const update = () => {
      if (checkbox) {
        const elements = Array.from(group).sort((left, right) => left.compareDocumentPosition(right) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
        setter(Array.from(new Set(elements.filter((element) => element.checked).map((element) => element.__value))));
      } else setter(element.__value);
    };
    element.addEventListener('change', update);
    const record = { group, dispose() {
      group.delete(element);
      element.removeEventListener('change', update);
      if (!group.size) {
        properties.delete(name);
        if (!properties.size) groups.delete(key);
      }
      $$group_members.delete(element);
    } };
    $$group_members.set(element, record);
    if (!previous) $$onScopeDispose(() => $$group_members.get(element)?.dispose());
  }
  element.checked = $$group_checked(getter(), element.__value, checkbox);
};
