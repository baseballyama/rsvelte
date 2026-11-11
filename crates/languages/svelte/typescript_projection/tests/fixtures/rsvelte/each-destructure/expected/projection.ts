;

	let { items, pairs, fixed }: typeof __rsvelte_public_props0 = $props();
	let fallback = $state('none');
	const plain = [{ name: 'a', tags: ['x'] }];

;

const __rsvelte_public_props0 = __rsvelte_props({
  items: __rsvelte_untyped_prop(),
  pairs: __rsvelte_untyped_prop(),
  fixed: __rsvelte_untyped_prop(),
}, {}, false);
() => {
  {
    for (let [, { id, name, size = 1, ...rest }] of __rsvelte_each(items)) {
      (id);
      {
        svelteHTML.createElement("p", {});
        (id);
        (name);
        (size);
        (rest.extra);
      }
    }
  }
  {
    for (let [i, [key, value]] of __rsvelte_each(pairs)) {
      {
        svelteHTML.createElement("span", {});
        (i);
        (key);
        (value);
      }
    }
  }
  {
    for (let [, { name, tags: [first = fallback] }] of __rsvelte_each(plain)) {
      {
        svelteHTML.createElement("b", {});
        (name);
        (first);
      }
    }
  }
  {
    for (let [, { label }] of __rsvelte_each(fixed)) {
      {
        svelteHTML.createElement("i", {});
        (label);
      }
    }
  }
};
export default __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">();
