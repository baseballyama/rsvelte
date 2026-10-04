;

	let { results }: typeof __rsvelte_public_props0 = $props();

;

const __rsvelte_public_props0 = __rsvelte_props({
  results: __rsvelte_untyped_prop(),
}, {}, false);
() => {
  {
    for (let [, result] of __rsvelte_each(results)) {
      {
        svelteHTML.createElement("p", {});
        (result.title);
      }
    }
    {
      {
        svelteHTML.createElement("p", {});
      }
    }
  }
};
export default __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">();
