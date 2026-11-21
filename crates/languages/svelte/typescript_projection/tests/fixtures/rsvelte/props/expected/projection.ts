;
function $$render() {
  
	let /** @type {typeof __rsvelte_public_props0} */ { name } = $props();

;

  const __rsvelte_public_props0 = __rsvelte_props({
    name: __rsvelte_untyped_prop(),
  }, {}, false);
  async () => {
    {
      svelteHTML.createElement("p", {});
      name;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
}
export const Props__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof Props__SvelteComponent_>} Props__SvelteComponent_ */
export default Props__SvelteComponent_;
