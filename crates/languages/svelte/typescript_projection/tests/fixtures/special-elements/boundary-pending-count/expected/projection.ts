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
const BoundaryPendingCount__SvelteComponent_ = __rsvelte_export_component();
export default BoundaryPendingCount__SvelteComponent_;
