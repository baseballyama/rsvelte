;

	let { items, rest }: typeof __rsvelte_public_props0 = $props();
	let count = $state(0);

;

const __rsvelte_public_props0 = __rsvelte_props({
  items: __rsvelte_untyped_prop(),
  rest: __rsvelte_untyped_prop(),
}, {}, false);
() => {
  {
    svelteHTML.createElement("ul", {});
    {
      __rsvelte_slots()("default", {});
    }
  }
  {
    __rsvelte_slots()("header", {
      "title": "Hi",
      count,
      "total": items.length,
      "first": items.at(0),
      ...(rest),
    });
    {
      svelteHTML.createElement("p", {});
      (count);
    }
  }
  {
    svelteHTML.createElement("div", {});
    {
      __rsvelte_slots()("footer", {
        "label": `a ${count} b`,
      });
    }
  }
  {
    svelteHTML.createElement("button", {
      "onclick": () => count++,
    });
  }
};
export default __rsvelte_export_component<__rsvelte_props_with_children<typeof __rsvelte_public_props0>, {}, "">();
