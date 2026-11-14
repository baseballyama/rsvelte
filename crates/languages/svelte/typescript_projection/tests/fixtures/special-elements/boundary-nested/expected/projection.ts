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
const BoundaryNested__SvelteComponent_ = __rsvelte_export_component();
export default BoundaryNested__SvelteComponent_;
