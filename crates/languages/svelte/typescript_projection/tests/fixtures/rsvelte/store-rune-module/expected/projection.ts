;

	const data = $state({ n: 0 });
	const state = { data };;let $state = __sveltets_2_store_get(state);


;

function $$render() {
  async () => {
    {
      svelteHTML.createElement("p", {});
      state.data.n;
    }
  };
  return (/** @type {typeof __rsvelte_export_isomorphic<{ [x: string]: never }, {}, string>} */ (__rsvelte_export_isomorphic))()(__rsvelte_any_event({}), {});
}
export const StoreRuneModule__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof StoreRuneModule__SvelteComponent_>} StoreRuneModule__SvelteComponent_ */
export default StoreRuneModule__SvelteComponent_;
