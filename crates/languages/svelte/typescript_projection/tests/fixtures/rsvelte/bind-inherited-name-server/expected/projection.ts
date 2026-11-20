;
function $$render() {
  
	let x = $state();

;

  async () => {
    {
      svelteHTML.createElement("svelte:window", {
        "bind:constructor": x,
      });
      () => {
        // @ts-ignore
        x = __rsvelte_untyped_prop();
      };
    }
    {
      svelteHTML.createElement("div", {
        "bind:toString": x,
      });
      () => {
        // @ts-ignore
        x = __rsvelte_untyped_prop();
      };
    }
    {
      svelteHTML.createElement("svg", {
        "bind:valueOf": x,
      });
      () => {
        // @ts-ignore
        x = __rsvelte_untyped_prop();
      };
    }
  };
  return (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
}
const BindInheritedNameServer__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof BindInheritedNameServer__SvelteComponent_>} */ (BindInheritedNameServer__SvelteComponent_);
