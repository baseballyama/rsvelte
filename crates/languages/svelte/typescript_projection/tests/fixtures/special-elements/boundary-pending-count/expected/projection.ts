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
const BoundaryPendingCount__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type BoundaryPendingCount__SvelteComponent_ = ReturnType<typeof BoundaryPendingCount__SvelteComponent_>;
export default BoundaryPendingCount__SvelteComponent_;
