;
function $$render() {
  async () => {
    {
      svelteHTML.createElement("svelte:window", {
        "on:resize": undefined,
      });
    }
    {
      svelteHTML.createElement("svelte:document", {
        "on:visibilitychange": undefined,
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_isomorphic<{ [x: string]: never }, {}, string>} */ (__rsvelte_export_isomorphic))()(__rsvelte_any_event({
    "resize": __rsvelte_window_event("resize"),
    "visibilitychange": undefined,
  }), {});
}
export const GlobalOnForward__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof GlobalOnForward__SvelteComponent_>} GlobalOnForward__SvelteComponent_ */
export default GlobalOnForward__SvelteComponent_;
