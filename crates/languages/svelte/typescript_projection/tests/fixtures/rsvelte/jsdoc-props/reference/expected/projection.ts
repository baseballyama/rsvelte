;
function $$render() {
  
	// @ts-check
	/** @typedef {{ n: string }} Props */
	/** @type {typeof __rsvelte_public_props0} */ 
	let { n = 1 } = $props();

;

  const __rsvelte_public_props0 = /** @type {Props} */({});
  async () => {
    {
      svelteHTML.createElement("p", {});
      n;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
}
const Reference__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof Reference__SvelteComponent_>} */ (Reference__SvelteComponent_);
