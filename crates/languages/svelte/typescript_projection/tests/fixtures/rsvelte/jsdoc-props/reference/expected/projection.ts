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
export const Reference__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof Reference__SvelteComponent_>} Reference__SvelteComponent_ */
export default Reference__SvelteComponent_;
