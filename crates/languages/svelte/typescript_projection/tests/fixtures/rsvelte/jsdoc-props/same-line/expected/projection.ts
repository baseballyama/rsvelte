;
function $$render() {
  
	// @ts-check
	let /** @type {typeof __rsvelte_public_props0} */ /** @type {{ n: string }} */ { n = 1 } = $props();

;

  const __rsvelte_public_props0 = __rsvelte_props({}, {
    n: 1,
  }, false);
  async () => {
    {
      svelteHTML.createElement("p", {});
      n;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
}
export const SameLine__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof SameLine__SvelteComponent_>} SameLine__SvelteComponent_ */
export default SameLine__SvelteComponent_;
