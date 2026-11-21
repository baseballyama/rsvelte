;
function $$render() {
  
	let props = $props();
	let n = $state(0);
	const value = $derived(props.number ?? 0);
	const e = $state.eager(n);
	function f() { return $state.eager(n) + 1; }

;

  async () => {
    {
      svelteHTML.createElement("div", {});
      value;
    }
    {
      svelteHTML.createElement("div", {});
      $state.eager(value);
    }
    {
      svelteHTML.createElement("button", {
        "onclick": () => n++,
      });
      e;
      f();
      $state.eager(n);
    }
  };
  return (/** @type {typeof __rsvelte_export_component<any, {}, "">} */ (__rsvelte_export_component))();
}
export const StateEager__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof StateEager__SvelteComponent_>} StateEager__SvelteComponent_ */
export default StateEager__SvelteComponent_;
