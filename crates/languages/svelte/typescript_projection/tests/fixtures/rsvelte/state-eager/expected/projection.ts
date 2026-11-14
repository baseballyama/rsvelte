;

	let props = $props();
	let n = $state(0);
	const value = $derived(props.number ?? 0);
	const e = $state.eager(n);
	function f() { return $state.eager(n) + 1; }

;

async () => {
  {
    svelteHTML.createElement("div", {});
    (value);
  }
  {
    svelteHTML.createElement("div", {});
    ($state.eager(value));
  }
  {
    svelteHTML.createElement("button", {
      "onclick": () => n++,
    });
    (e);
    (f());
    ($state.eager(n));
  }
};
const StateEager__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<any, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof StateEager__SvelteComponent_>} */ (StateEager__SvelteComponent_);
