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
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const BindInheritedNameServer__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof BindInheritedNameServer__SvelteComponent_>} BindInheritedNameServer__SvelteComponent_ */
export default BindInheritedNameServer__SvelteComponent_;
