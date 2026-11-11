;
function onerror(error, reset) { console.log(error); } function failed() {}
;

async () => {
  {
    svelteHTML.createElement("svelte:boundary", {
      onerror,
      failed,
    });
    {
      svelteHTML.createElement("p", {});
    }
  }
};
const BoundaryAttrs__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type BoundaryAttrs__SvelteComponent_ = ReturnType<typeof BoundaryAttrs__SvelteComponent_>;
export default BoundaryAttrs__SvelteComponent_;
