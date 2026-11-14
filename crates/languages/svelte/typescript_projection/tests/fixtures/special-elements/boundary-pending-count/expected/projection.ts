;
async () => {
  {
    svelteHTML.createElement("svelte:boundary", {});
    {
      svelteHTML.createElement("p", {});
      ($effect.pending());
    }
  }
};
const BoundaryPendingCount__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof BoundaryPendingCount__SvelteComponent_>} */ (BoundaryPendingCount__SvelteComponent_);
