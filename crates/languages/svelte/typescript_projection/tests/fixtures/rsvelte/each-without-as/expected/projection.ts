;

	/** @type {typeof __rsvelte_public_props0} */ let { items = [], count = 2 } = $props();
	let item = $state('outer');

;

const __rsvelte_public_props0 = __rsvelte_props({}, {
  items: __rsvelte_array_prop(),
  count: 2,
}, false);
async () => {
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
const EachWithoutAs__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof EachWithoutAs__SvelteComponent_>} */ (EachWithoutAs__SvelteComponent_);
