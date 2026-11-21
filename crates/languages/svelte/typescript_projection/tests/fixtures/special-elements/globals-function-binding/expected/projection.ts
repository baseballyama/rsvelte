;
function $$render() {
  let x = $state(0); function get() { return x; } function set(value) { x = value; }
;

  async () => {
    {
      svelteHTML.createElement("svelte:window", {
        "bind:scrollX": __rsvelte_get_set(get, set),
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const GlobalsFunctionBinding__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof GlobalsFunctionBinding__SvelteComponent_>} GlobalsFunctionBinding__SvelteComponent_ */
export default GlobalsFunctionBinding__SvelteComponent_;
