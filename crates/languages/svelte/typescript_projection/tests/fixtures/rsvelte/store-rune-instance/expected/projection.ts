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
      count;
      state.a;
    }
  };
  return (/** @type {typeof __rsvelte_export_isomorphic<{ [x: string]: never }, {}, string>} */ (__rsvelte_export_isomorphic))()(__rsvelte_any_event({}), {});
}
export const StoreRuneInstance__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof StoreRuneInstance__SvelteComponent_>} StoreRuneInstance__SvelteComponent_ */
export default StoreRuneInstance__SvelteComponent_;
