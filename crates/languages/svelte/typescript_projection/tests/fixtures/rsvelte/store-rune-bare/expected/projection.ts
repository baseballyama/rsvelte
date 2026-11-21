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
  return (/** @type {typeof __rsvelte_export_isomorphic<{ [x: string]: never }, { [evt: string]: CustomEvent<any> }, {}, string>} */ (__rsvelte_export_isomorphic))()({});
}
export const StoreRuneBare__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof StoreRuneBare__SvelteComponent_>} StoreRuneBare__SvelteComponent_ */
export default StoreRuneBare__SvelteComponent_;
