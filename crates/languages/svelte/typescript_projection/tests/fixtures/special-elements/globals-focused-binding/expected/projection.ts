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
  return (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
}
const GlobalsFocusedBinding__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof GlobalsFocusedBinding__SvelteComponent_>} */ (GlobalsFocusedBinding__SvelteComponent_);
