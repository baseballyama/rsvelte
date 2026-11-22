;
function $$render() {
  
	let v = $state("");

;

  async () => {
    {
      svelteHTML.createElement("p", {});
      v;
    }
    {
      svelteHTML.createElement("input", {
        "bind:value": v,
      });
      () => {
        // @ts-ignore
        v = __rsvelte_untyped_prop();
      };
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const BindValueOnAnElement__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof BindValueOnAnElement__SvelteComponent_>} BindValueOnAnElement__SvelteComponent_ */
export default BindValueOnAnElement__SvelteComponent_;
