;
function $$render() {
  
	let x = $state();
	let c = $state(true);

;

  async () => {
    {
      svelteHTML.createElement("div", {
        "contenteditable": c,
        "bind:textContent": x,
      });
      () => {
        // @ts-ignore
        x = __rsvelte_untyped_prop();
      };
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const BindContentBesideDynamicContenteditable__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof BindContentBesideDynamicContenteditable__SvelteComponent_>} BindContentBesideDynamicContenteditable__SvelteComponent_ */
export default BindContentBesideDynamicContenteditable__SvelteComponent_;
