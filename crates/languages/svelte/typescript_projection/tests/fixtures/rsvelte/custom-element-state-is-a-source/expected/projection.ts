;

	let n = $state(1);
	let d = $derived(2);

;

async () => {
  {
    svelteHTML.createElement("svelte:options", {
      "customelement": "my-el",
    });
  }
  {
    svelteHTML.createElement("p", {});
    (n);
  }
  {
    svelteHTML.createElement("p", {
      "title": d,
    });
  }
};
const CustomElementStateIsASource__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof CustomElementStateIsASource__SvelteComponent_>} */ (CustomElementStateIsASource__SvelteComponent_);
