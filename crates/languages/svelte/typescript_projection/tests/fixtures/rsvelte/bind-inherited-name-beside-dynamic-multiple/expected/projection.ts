;
function $$render() {
  
	let x = $state();
	let t = $state(false);

;

  async () => {
    {
      svelteHTML.createElement("select", {
        "multiple": t,
        "bind:toString": x,
      });
      () => {
        // @ts-ignore
        x = __rsvelte_untyped_prop();
      };
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const BindInheritedNameBesideDynamicMultiple__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof BindInheritedNameBesideDynamicMultiple__SvelteComponent_>} BindInheritedNameBesideDynamicMultiple__SvelteComponent_ */
export default BindInheritedNameBesideDynamicMultiple__SvelteComponent_;
