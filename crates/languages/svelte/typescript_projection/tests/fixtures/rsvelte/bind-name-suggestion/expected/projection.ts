;
function $$render() {
  
	let w = $state(0);

;

  async () => {
    {
      svelteHTML.createElement("svelte:window", {
        "bind:innerwidth": w,
      });
      () => {
        // @ts-ignore
        w = __rsvelte_untyped_prop();
      };
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const BindNameSuggestion__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof BindNameSuggestion__SvelteComponent_>} BindNameSuggestion__SvelteComponent_ */
export default BindNameSuggestion__SvelteComponent_;
