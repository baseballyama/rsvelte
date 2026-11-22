;
function $$render() {
  
	let v = $state(1);
	const p = Promise.resolve(1);

;

  async () => {
    {
      svelteHTML.createElement("input", {
        "bind:value": __rsvelte_get_set(async () => await p, (nv) => (v = nv)),
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const BindPairGetterAwait__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof BindPairGetterAwait__SvelteComponent_>} BindPairGetterAwait__SvelteComponent_ */
export default BindPairGetterAwait__SvelteComponent_;
