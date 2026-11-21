;
function $$render() {
  
	let x = $state();
	let ty = $state('checkbox');

;

  async () => {
    {
      svelteHTML.createElement("input", {
        "type": ty,
        "bind:checked": x,
      });
      () => {
        // @ts-ignore
        x = __rsvelte_untyped_prop();
      };
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const BindCheckedBesideDynamicType__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof BindCheckedBesideDynamicType__SvelteComponent_>} BindCheckedBesideDynamicType__SvelteComponent_ */
export default BindCheckedBesideDynamicType__SvelteComponent_;
