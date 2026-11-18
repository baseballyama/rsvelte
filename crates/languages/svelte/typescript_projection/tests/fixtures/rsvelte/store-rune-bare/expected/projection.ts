;

	const state = { a: 1 };;let $state = __rsvelte_store_get(state);

	const x = $state;

;

function $$render() {
  async () => {
    {
      svelteHTML.createElement("p", {});
      state.a;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
}
const StoreRuneBare__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof StoreRuneBare__SvelteComponent_>} */ (StoreRuneBare__SvelteComponent_);
