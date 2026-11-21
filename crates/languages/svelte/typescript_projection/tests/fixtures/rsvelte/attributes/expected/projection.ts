;
function $$render() {
  
	/** @type {typeof __rsvelte_public_props0} */ let { href, label } = $props();

;

  const __rsvelte_public_props0 = __rsvelte_props({
    href: __rsvelte_untyped_prop(),
    label: __rsvelte_untyped_prop(),
  }, {}, false);
  async () => {
    {
      svelteHTML.createElement("a", {
        href,
        "class": "link",
        "title": `go to ${label}`,
      });
      label;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
}
export const Attributes__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof Attributes__SvelteComponent_>} Attributes__SvelteComponent_ */
export default Attributes__SvelteComponent_;
