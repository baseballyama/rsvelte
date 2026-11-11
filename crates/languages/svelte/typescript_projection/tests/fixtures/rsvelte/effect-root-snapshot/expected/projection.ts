;

	let items = $state([1, 2]);
	const cleanup = $effect.root(() => {
		$effect(() => {
			console.log($state.snapshot(items));
		});
		return () => {};
	});
	$effect.root(() => {});
	function copy() {
		return $state.snapshot(items);
	}

;

() => {
  {
    svelteHTML.createElement("button", {
      "onclick": () => console.log(copy(), cleanup),
    });
    (copy().length);
  }
};
export default __rsvelte_export_component<__rsvelte_no_props, {}, "">();
