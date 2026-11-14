;

	let result = $state();

	function measure() {
		let items = $state([1, 2]);
		let total = $derived(items.length);
		items.push(3);
		result = total;
	}

;

async () => {
  {
    svelteHTML.createElement("button", {
      "onclick": measure,
    });
    (result);
  }
};
const NestedRunes__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof NestedRunes__SvelteComponent_>} */ (NestedRunes__SvelteComponent_);
