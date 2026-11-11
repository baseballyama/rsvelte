;
let { pending }: typeof __rsvelte_public_props0 = $props();
;

const __rsvelte_public_props0 = __rsvelte_props({
  pending: __rsvelte_untyped_prop(),
}, {}, false);
async () => {
  {
    svelteHTML.createElement("svelte:boundary", {
      pending,
    });
    {
      svelteHTML.createElement("p", {});
    }
  }
};
const BoundaryPendingAttribute__SvelteComponent_ = __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">();
type BoundaryPendingAttribute__SvelteComponent_ = ReturnType<typeof BoundaryPendingAttribute__SvelteComponent_>;
export default BoundaryPendingAttribute__SvelteComponent_;
