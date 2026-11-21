;

	const data = $state({ n: 0 });
	const state = { data };;let $state = __rsvelte_store_get(state);


;

function $$render() {
  async () => {
    {
      svelteHTML.createElement("p", {});
      state.data.n;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const StoreRuneModule__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof StoreRuneModule__SvelteComponent_>} StoreRuneModule__SvelteComponent_ */
export default StoreRuneModule__SvelteComponent_;
