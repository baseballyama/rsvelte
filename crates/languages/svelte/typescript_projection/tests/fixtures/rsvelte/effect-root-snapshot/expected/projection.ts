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
const EffectRootSnapshot__SvelteComponent_ = __rsvelte_export_component();
export default EffectRootSnapshot__SvelteComponent_;
