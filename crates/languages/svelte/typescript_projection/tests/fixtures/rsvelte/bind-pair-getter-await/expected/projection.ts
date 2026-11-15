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
  return (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
}
const BindPairGetterAwait__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof BindPairGetterAwait__SvelteComponent_>} */ (BindPairGetterAwait__SvelteComponent_);
