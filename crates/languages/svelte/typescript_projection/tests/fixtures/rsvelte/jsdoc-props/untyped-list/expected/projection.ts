;
function $$render() {
  
	// @ts-check
	let a = 1, /** @type {typeof __rsvelte_public_props0} */ { n } = $props();

;

  const __rsvelte_public_props0 = __rsvelte_props({
    n: __rsvelte_untyped_prop(),
  }, {}, false);
  async () => {
    {
      svelteHTML.createElement("p", {});
      n;
      a;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
}
export const UntypedList__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof UntypedList__SvelteComponent_>} UntypedList__SvelteComponent_ */
export default UntypedList__SvelteComponent_;
