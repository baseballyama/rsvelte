;
function $$render() {
  
	let focused = $state(false);

;

  async () => {
    {
      svelteHTML.createElement("input", {
        "bind:focused": focused,
      });
      () => {
        // @ts-ignore
        focused = __rsvelte_untyped_prop();
      };
    }
    {
      svelteHTML.createElement("svelte:window", {
        "bind:focused": focused,
      });
      () => {
        // @ts-ignore
        focused = __rsvelte_untyped_prop();
      };
    }
    {
      svelteHTML.createElement("svelte:document", {
        "bind:focused": focused,
      });
      () => {
        // @ts-ignore
        focused = __rsvelte_untyped_prop();
      };
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const GlobalsFocusedBinding__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof GlobalsFocusedBinding__SvelteComponent_>} GlobalsFocusedBinding__SvelteComponent_ */
export default GlobalsFocusedBinding__SvelteComponent_;
