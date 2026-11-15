;

	const data = $state({ n: 0 });
	const state = { data };;let $state = __rsvelte_store_get(state);


;

function $$render() {
  async () => {
    {
      svelteHTML.createElement("p", {});
      (state.data.n);
    }
  };
  return (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
}
const StoreRuneModule__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof StoreRuneModule__SvelteComponent_>} */ (StoreRuneModule__SvelteComponent_);
