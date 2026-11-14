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

async () => {
  {
    svelteHTML.createElement("button", {
      "onclick": () => console.log(copy(), cleanup),
    });
    (copy().length);
  }
};
const EffectRootSnapshot__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof EffectRootSnapshot__SvelteComponent_>} */ (EffectRootSnapshot__SvelteComponent_);
