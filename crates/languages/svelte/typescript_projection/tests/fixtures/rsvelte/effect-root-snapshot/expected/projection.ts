;
function $$render() {
  
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
      copy().length;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const EffectRootSnapshot__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof EffectRootSnapshot__SvelteComponent_>} EffectRootSnapshot__SvelteComponent_ */
export default EffectRootSnapshot__SvelteComponent_;
