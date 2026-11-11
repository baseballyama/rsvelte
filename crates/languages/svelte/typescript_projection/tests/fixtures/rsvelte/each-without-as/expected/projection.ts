;

	let { items = [], count = 2 }: typeof __rsvelte_public_props0 = $props();
	let item = $state('outer');

;

const __rsvelte_public_props0 = __rsvelte_props({}, {
  items: __rsvelte_empty_array([]),
  count: 2,
}, false);
() => {
  {
    for (let [, ] of __rsvelte_each(items)) {
      {
        svelteHTML.createElement("p", {});
        (item);
      }
    }
  }
  {
    for (let [i, ] of __rsvelte_each(items)) {
      {
        svelteHTML.createElement("p", {});
        (i);
      }
    }
  }
  {
    for (let [i, ] of __rsvelte_each({ length: count })) {
      {
        svelteHTML.createElement("span", {});
        (i);
      }
    }
    {
    }
  }
  {
    for (let [, ] of __rsvelte_each({ length: 3 })) {
      {
        svelteHTML.createElement("b", {});
      }
    }
  }
};
export default __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">();
