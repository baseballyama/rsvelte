;
function $$render() {
  
	let x = $state();

;

  async () => {
    {
      svelteHTML.createElement("div", {
        "bind:innerHTML": x,
      });
      () => {
        // @ts-ignore
        x = __rsvelte_untyped_prop();
      };
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const BindContentWithoutContenteditable__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof BindContentWithoutContenteditable__SvelteComponent_>} BindContentWithoutContenteditable__SvelteComponent_ */
export default BindContentWithoutContenteditable__SvelteComponent_;
