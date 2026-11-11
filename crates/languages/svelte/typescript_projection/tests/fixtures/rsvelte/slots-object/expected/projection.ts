;

	let { title, ...rest }: typeof __rsvelte_public_props0 = $props();
	const named = $$slots.header ? 'with' : 'without';

;

const __rsvelte_public_props0 = __rsvelte_props({
  title: __rsvelte_untyped_prop(),
}, {}, true);
() => {
  if ($$slots.header) {
    {
      svelteHTML.createElement("header", {});
      {
        __rsvelte_slots()("header", {});
      }
    }
  }
  {
    svelteHTML.createElement("h1", {
      ...(rest),
    });
    (title);
    (named);
  }
  {
    __rsvelte_slots()("default", {});
  }
};
export default __rsvelte_export_component<__rsvelte_props_with_children<typeof __rsvelte_public_props0>, {}, "">();
