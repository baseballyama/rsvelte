;
function $$render() {
  
	const state = { a: 1 };;let $state = __rsvelte_store_get(state);

	let count = $state(0);

;

  async () => {
    {
      svelteHTML.createElement("button", {
        "onclick": () => count++,
      });
      (count);
      (state.a);
    }
  };
  return (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
}
const StoreRuneInstance__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof StoreRuneInstance__SvelteComponent_>} */ (StoreRuneInstance__SvelteComponent_);
