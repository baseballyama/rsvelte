;
function $$render() {
  
	let x = $state();

;

  async () => {
    {
      svelteHTML.createElement("input", {
        "type": true,
        "bind:value": x,
      });
      () => {
        // @ts-ignore
        x = __rsvelte_untyped_prop();
      };
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const BindValueBesideBooleanType__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof BindValueBesideBooleanType__SvelteComponent_>} BindValueBesideBooleanType__SvelteComponent_ */
export default BindValueBesideBooleanType__SvelteComponent_;
