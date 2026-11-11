;

	let result = $state();

	function measure() {
		let items = $state([1, 2]);
		let total = $derived(items.length);
		items.push(3);
		result = total;
	}

;

() => {
  {
    svelteHTML.createElement("button", {
      "onclick": measure,
    });
    (result);
  }
};
const NestedRunes__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type NestedRunes__SvelteComponent_ = ReturnType<typeof NestedRunes__SvelteComponent_>;
export default NestedRunes__SvelteComponent_;
