;
function $$render() {
  
	let items = $state([{ a: 0 }]);
	let start = $state.snapshot(items);
	let eager = $state.eager(items);
	let pending = $effect.pending();
	function f() {
		const copy = $state.snapshot(items);
		return copy;
	}

;

  async () => {
    {
      svelteHTML.createElement("p", {});
      JSON.stringify(start);
      f();
      eager;
      pending;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const ServerRuneDeclarators__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof ServerRuneDeclarators__SvelteComponent_>} ServerRuneDeclarators__SvelteComponent_ */
export default ServerRuneDeclarators__SvelteComponent_;
