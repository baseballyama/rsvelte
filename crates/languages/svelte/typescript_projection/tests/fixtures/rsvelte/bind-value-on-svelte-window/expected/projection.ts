;
function $$render() {
  
	let v = $state(0);

;

  async () => {
    {
      svelteHTML.createElement("svelte:window", {
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
export const BindValueOnSvelteWindow__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof BindValueOnSvelteWindow__SvelteComponent_>} BindValueOnSvelteWindow__SvelteComponent_ */
export default BindValueOnSvelteWindow__SvelteComponent_;
