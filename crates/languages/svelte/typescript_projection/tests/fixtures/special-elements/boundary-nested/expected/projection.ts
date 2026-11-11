;
async () => {
  {
    svelteHTML.createElement("p", {});
  }
  {
    svelteHTML.createElement("svelte:boundary", {});
    {
      svelteHTML.createElement("svelte:boundary", {});
      {
        svelteHTML.createElement("p", {});
      }
    }
  }
  {
    svelteHTML.createElement("p", {});
  }
};
const BoundaryNested__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type BoundaryNested__SvelteComponent_ = ReturnType<typeof BoundaryNested__SvelteComponent_>;
export default BoundaryNested__SvelteComponent_;
