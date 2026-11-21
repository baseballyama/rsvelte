;
function $$render() {
  
	/** @type {typeof __rsvelte_public_props0} */ let { name } = $props();

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
export const Component__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof Component__SvelteComponent_>} Component__SvelteComponent_ */
export default Component__SvelteComponent_;
