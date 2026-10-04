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
      onclick: measure,
    });
    (result);
  }
};
export default __rsvelte_export_component<Record<string, never>, {}, "">();
