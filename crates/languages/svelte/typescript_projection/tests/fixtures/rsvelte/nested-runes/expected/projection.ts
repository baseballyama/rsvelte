;
function $$render() {
  
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
      result;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const NestedRunes__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof NestedRunes__SvelteComponent_>} NestedRunes__SvelteComponent_ */
export default NestedRunes__SvelteComponent_;
