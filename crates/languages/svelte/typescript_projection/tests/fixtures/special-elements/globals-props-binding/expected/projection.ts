;
function $$render() {
  /** @type {typeof __rsvelte_public_props0} */ let { width = $bindable(), x = $bindable() } = $props();
  width;
  x;

;

  const __rsvelte_public_props0 = __rsvelte_props({}, {
    width: __rsvelte_untyped_prop(),
    x: __rsvelte_untyped_prop(),
  }, false);
  async () => {
    {
      svelteHTML.createElement("svelte:window", {
        "bind:innerWidth": width,
        "bind:scrollX": x,
      });
      () => {
        // @ts-ignore
        width = __rsvelte_untyped_prop();
      };
      () => {
        // @ts-ignore
        x = __rsvelte_untyped_prop();
      };
    }
  };
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "width" | "x">} */ (__rsvelte_export_component))();
}
export const GlobalsPropsBinding__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof GlobalsPropsBinding__SvelteComponent_>} GlobalsPropsBinding__SvelteComponent_ */
export default GlobalsPropsBinding__SvelteComponent_;
