;
function $$render() {
  async () => {
    {
      svelteHTML.createElement("svelte:boundary", {});
      {
        svelteHTML.createElement("p", {});
        $effect.pending();
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const BoundaryPendingCount__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof BoundaryPendingCount__SvelteComponent_>} BoundaryPendingCount__SvelteComponent_ */
export default BoundaryPendingCount__SvelteComponent_;
