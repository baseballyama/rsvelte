;

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
    (JSON.stringify(start));
    (f());
    (eager);
    (pending);
  }
};
const ServerRuneDeclarators__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof ServerRuneDeclarators__SvelteComponent_>} */ (ServerRuneDeclarators__SvelteComponent_);
