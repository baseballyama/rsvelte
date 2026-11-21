;
function $$render() {
  
	/** @type {typeof __rsvelte_public_props0} */ let { children, ...rest } = $props();

;

  const __rsvelte_public_props0 = __rsvelte_props({
    children: __rsvelte_untyped_prop(),
  }, {}, true);
  async () => {
    {
      svelteHTML.createElement("div", {
        ...(rest),
      });
    }
    {
      svelteHTML.createElement("section", {
        "id": "main",
        ...(rest),
        "title": "after",
      });
    }
    {
      svelteHTML.createElement("button", {
        ...(rest),
      });
    }
    {
      svelteHTML.createElement("img", {
        ...(rest),
        "alt": "",
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
}
export const Spread__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof Spread__SvelteComponent_>} Spread__SvelteComponent_ */
export default Spread__SvelteComponent_;
