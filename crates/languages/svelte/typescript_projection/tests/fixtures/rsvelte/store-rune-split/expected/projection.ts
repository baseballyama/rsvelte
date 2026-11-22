;

	const state = { a: 1 };;let $state = __rsvelte_store_get(state);


;

function $$render() {
  
	let count = $state(0);

;

  async () => {
    {
      svelteHTML.createElement("button", {
        "onclick": () => count++,
      });
      count;
      state.a;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const StoreRuneSplit__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof StoreRuneSplit__SvelteComponent_>} StoreRuneSplit__SvelteComponent_ */
export default StoreRuneSplit__SvelteComponent_;
