;
function $$render() {
  
	let w = $state(0);

;

  async () => {
    {
      svelteHTML.createElement("div", {
        "bind:whatever": w,
      });
      () => {
        // @ts-ignore
        w = __rsvelte_untyped_prop();
      };
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const BindUnknownName__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof BindUnknownName__SvelteComponent_>} BindUnknownName__SvelteComponent_ */
export default BindUnknownName__SvelteComponent_;
